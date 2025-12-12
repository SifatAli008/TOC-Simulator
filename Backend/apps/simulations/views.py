from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from datetime import timedelta
import logging
from rest_framework.permissions import BasePermission

from .models import SimulationSessions, SimulationRun
from .serializers import (
    SimulationSessionsListSerializer,
    SimulationSessionsDetailSerializer,
    SimulationSessionsCreateSerializer,
    SimulationSessionsUpdateSerializer,
    SimulationRunSerializer,
)

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# Permissions
class IsOwnerOrSharedReadOnly(BasePermission):
    """
    Link-based sharing permission:
    - Owner: Full CRUD access
    - Anyone with UUID link: Read-only (if is_shared=True)
    """
    
    def has_permission(self, request, view):
        # List: Only authenticated users
        if view.action == 'list':
            return request.user and request.user.is_authenticated
        
        # Retrieve: Anyone
        if view.action == 'retrieve':
            return True
        
        # Create/Update/Delete: Must be authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Owner: Full access
        if obj.user == request.user:
            return True
        
        # Shared session: Read-only for anyone with the UUID
        if request.method in ['GET', 'HEAD', 'OPTIONS'] and obj.is_shared:
            return True
        
        return False

# Main ViewSet
class SimulationSessionsViewSet(viewsets.ModelViewSet):
    
    queryset = SimulationSessions.objects.all()
    
    serializer_class = SimulationSessionsListSerializer

    permission_classes = [IsAuthenticated, IsOwnerOrSharedReadOnly]

    pagination_class = StandardResultsSetPagination

    lookup_field = 'public_id'

    # Filtering and Searching
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['automata_type', 'is_favorite']
    search_fields = ['session_name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'session_name']
    ordering = ['-last_accessed_at']

    # Override get_queryset to filter
    def get_queryset(self):
        """
        Smart queryset for link-based sharing:
        - list: Only user's sessions
        - retrieve: All sessions (permission will check is_shared)
        """
        
        # Detail view: Allow accessing shared sessions by UUID
        if self.action == 'retrieve':
            return SimulationSessions.objects.all().select_related('user').prefetch_related(
                Prefetch(
                    'runs',
                    queryset=SimulationRun.objects.order_by('-created_at')[:5]
                )
            )
        
        # List view: Only user's own sessions
        queryset = SimulationSessions.objects.filter(
            user=self.request.user
        )
        queryset = queryset.select_related('user')
        queryset = queryset.prefetch_related(
            Prefetch(
                'runs',
                queryset=SimulationRun.objects.order_by('-created_at')[:5]
            )
        )
        queryset = queryset.annotate(
            run_count=Count('runs')
        )
    
        # Conditional filtering based on query params
        automata_type = self.request.query_params.get('type')
        if automata_type:
            queryset = queryset.filter(automata_type=automata_type.upper())
        
        logger.debug(f"Queryset for user {self.request.user.email}: {queryset.query}")

        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SimulationSessionsListSerializer
        
        elif self.action == 'create':
            return SimulationSessionsCreateSerializer
        
        elif self.action in ['update', 'partial_update']:
            return SimulationSessionsUpdateSerializer
        
        # Default: Full detail serializer
        return SimulationSessionsDetailSerializer
    
    def perform_create(self, serializer):
        session = serializer.save(user=self.request.user)
        
        logger.info(
            f"User {self.request.user.email} created session "
            f"'{session.session_name}' (ID: {session.id})"
        )
    
    def perform_update(self, serializer):
        serializer.save(last_accessed_at=timezone.now())
        
        logger.info(
            f"User {self.request.user.email} updated session "
            f"{serializer.instance.id}"
        )
    
    def perform_destroy(self, instance):
        session_name = instance.session_name
        session_id = instance.id

        instance.delete()
        
        logger.warning(
            f"User {self.request.user.email} deleted session "
            f"'{session_name}' (ID: {session_id})"
        )
    
    # Custom Actions
    @action(detail=True, methods=['post'])
    def save_run(self, request, public_id=None):
        """
        Custom endpoint: POST /sessions/{id}/save_run/

        Save a simulation run for the specified session
        """
        session = self.get_object()

        serializer = SimulationRunSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save(session=session)

        # Update session's last_accessed timestamp
        session.last_accessed_at = timezone.now()
        session.save(update_fields=['last_accessed_at'])

        logger.info(
            f"Saved run for session {session.id}: "
            f"input='{serializer.data['input_string']}' "
            f"accepted={serializer.data['is_accepted']}"
        )
        
        return Response(
            {
                'message': 'Run saved successfully',
                'run': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, public_id=None):
        """
        Custom endpoint: POST /sessions/{id}/duplicate/
        
        Duplicate an existing session
        """
        session = self.get_object()
        
        # Get new name from request or generate
        new_name = request.data.get('name', f"{session.session_name} (Copy)")
        
        # Use model method for business logic
        duplicate_session = session.duplicate(new_name=new_name)
        
        # Serialize and return
        serializer = self.get_serializer(duplicate_session)
        
        return Response(
            {
                'message': f'Session duplicated successfully',
                'session': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, public_id=None):
        """
        Custom endpoint: POST /sessions/{id}/toggle_favorite/
        
        Toggle favorite status
        """
        session = self.get_object()
        session.is_favorite = not session.is_favorite
        session.save(update_fields=['is_favorite'])
        
        return Response({
            'message': f"Session {'added to' if session.is_favorite else 'removed from'} favorites",
            'is_favorite': session.is_favorite
        })
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """
        Custom endpoint: GET /sessions/favorites/
        
        detail=False: Operates on collection, not single item
        No {id} required
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(is_favorite=True)
        )
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        # No pagination
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Custom endpoint: GET /sessions/recent/
        
        Get recently accessed sessions
        """
        days = int(request.query_params.get('days', 7))
        queryset = self.filter_queryset(
            self.get_queryset().filter(
                last_accessed_at__gte=timezone.now() - timedelta(days=days)
            )
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Custom endpoint: GET /sessions/statistics/
        
        Return user's simulation statistics
        """
        user_sessions = self.get_queryset()
        
        stats = {
            'total_sessions': user_sessions.count(),
            'favorites_count': user_sessions.filter(is_favorite=True).count(),
            'shared_count': user_sessions.filter(is_shared=True).count(),
            'recent_count': user_sessions.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count(),
        }
        
        return Response(stats)
    
    # Sharing Actions
    @action(detail=True, methods=['post'])
    def generate_share_link(self, request, public_id=None):
        """
        Custom endpoint: POST /sessions/{uuid}/generate_share_link/
        
        Enable sharing and return shareable link.
        Only owner can generate links.
        
        Example response:
        {
            "message": "Share link generated successfully",
            "share_url": "/shared/550e8400-e29b-41d4-a716-446655440000",
            "public_id": "550e8400-e29b-41d4-a716-446655440000",
            "is_shared": true,
            "full_url": "https://api.example.com/shared/550e8400-e29b-41d4-a716-446655440000"
        }
        """
        session = self.get_object()
        
        # Only owner can generate share links
        if session.user != request.user:
            return Response(
                {'error': 'Only the owner can share this session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Enable sharing
        session.is_shared = True
        session.save(update_fields=['is_shared'])
        
        # Build shareable URL
        share_url = f"/shared/{session.public_id}"
        full_url = f"{request.scheme}://{request.get_host()}/shared/{session.public_id}"
        
        logger.info(
            f"User {request.user.email} generated share link for session {session.id}"
        )
        
        return Response({
            'message': 'Share link generated successfully',
            'share_url': share_url,
            'public_id': str(session.public_id),
            'is_shared': True,
            'full_url': full_url
        })
    
    @action(detail=True, methods=['post'])
    def revoke_share_link(self, request, public_id=None):
        """
        Custom endpoint: POST /sessions/{uuid}/revoke_share_link/
        """
        session = self.get_object()
        
        # Only owner can revoke
        if session.user != request.user:
            return Response(
                {'error': 'Only the owner can revoke sharing'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Disable sharing
        session.is_shared = False
        session.save(update_fields=['is_shared'])
        
        logger.info(
            f"User {request.user.email} revoked share link for session {session.id}"
        )
        
        return Response({
            'message': 'Share link revoked successfully',
            'is_shared': False
        })
    
    @action(detail=True, methods=['get'], permission_classes=[])
    def shared(self, request, public_id=None):
        """
        Custom endpoint: GET /sessions/{uuid}/shared/
        
        PUBLIC endpoint for viewing shared sessions.
        NO authentication required!

        Example request:
        GET /simulator/sessions/550e8400-e29b-41d4-a716-446655440000/shared/
        
        Returns:
        - Full session details if shared
        - 404 if not found or not shared
        - Includes owner info and whether current user is owner
        """
        try:
            session = SimulationSessions.objects.get(
                public_id=public_id,
                is_shared=True
            )
        except SimulationSessions.DoesNotExist:
            return Response(
                {'error': 'Session not found or not shared'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use detail serializer for full data
        serializer = SimulationSessionsDetailSerializer(
            session,
            context={'request': request}
        )
        
        # Add sharing metadata
        data = serializer.data
        data['is_owner'] = (
            request.user.is_authenticated and 
            session.user == request.user
        )
        data['shared_by'] = {
            'username': session.user.username,
            'first_name': session.user.first_name,
            'last_name': session.user.last_name
        }
        
        return Response(data)

class SimulationRunViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ReadOnlyModelViewSet: Only list and retrieve
    
    """
    serializer_class = SimulationRunSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # Only show runs from user's sessions
        return SimulationRun.objects.filter(
            session__user=self.request.user
        ).select_related('session')
        