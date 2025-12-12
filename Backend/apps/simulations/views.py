from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
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
class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return obj.is_shared or obj.user == request.user
        return obj.user == request.user

# Main ViewSet
class SimulationSessionsViewSet(viewsets.ModelViewSet):
    
    queryset = SimulationSessions.objects.all()
    
    serializer_class = SimulationSessionsListSerializer

    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    pagination_class = StandardResultsSetPagination

    lookup_field = 'public_id'

    # Filtering and Searching
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['automata_type', 'is_favorite', 'is_shared']
    search_fields = ['session_name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'session_name']
    ordering = ['-laset_accessed_at']

    # Override get_queryset to filter
    def get_queryset(self):

        queryset = SimulationSessions.objects.filter(
            user = self.request.user
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
        
        # Show shared sessions
        include_shared = self.request.query_params.get('include_shared')
        if include_shared == 'true':
            queryset = SimulationSessions.objects.filter(
                Q(user=self.request.user) | Q(is_shared=True)
            )
        
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
                last_accessed_at__gte=timezone.now() - timezone.timedelta(days=days)
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
                created_at__gte=timezone.now() - timezone.timedelta(days=7)
            ).count(),
        }
        
        return Response(stats)

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
        