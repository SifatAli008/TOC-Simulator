from rest_framework import serializers
from .models import SimulationSessions, SimulationRun
from django.contrib.auth import get_user_model
import logging

User = get_user_model()

class SimulationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationRun
        fields = [
            'id',
            'input_string',
            'is_accepted',
            'execution_time',
            'result_steps',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SimulationSessionsListSerializer(serializers.ModelSerializer):
    run_count = serializers.SerializerMethodField()
    class Meta:
        model = SimulationSessions
        fields = [
            'id',
            'public_id',
            'session_name',
            'automata_type',
            'is_favorite',
            'is_shared',
            'created_at',
            'last_accessed_at',
            'run_count'
        ]
    def get_run_count(self, obj):
        return obj.runs.count()

class SimulationSessionsDetailSerializer(serializers.ModelSerializer):
    runs = SimulationRunSerializer(many=True, read_only=True)
    
    state_count = serializers.IntegerField(read_only=True)
    transition_count = serializers.IntegerField(read_only=True)
    
    # New fields for sharing
    share_url = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = SimulationSessions
        fields = [
            'id',
            'public_id',
            'session_name',
            'description',
            'automata_type',
            'automata_data',
            'is_favorite',
            'is_shared',
            'share_url',
            'is_owner',
            'created_at',
            'updated_at',
            'last_accessed_at',
            'state_count',
            'transition_count',
            'runs'
        ]
    
    def get_share_url(self, obj):
        """
        Returns shareable URL if session is shared.
        """
        if obj.is_shared:
            request = self.context.get('request')
            if request:
                return f"{request.scheme}://{request.get_host()}/shared/{obj.public_id}"
        return None
    
    def get_is_owner(self, obj):
        """
        Check if current user is the owner.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

class SimulationSessionsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationSessions
        fields = [
            'session_name',
            'description',
            'automata_type',
            'automata_data'
        ]
    
    # Validate automata_data structure
    def validate_automata_data(self, value):

        required_keys = ['states', 'transitions', 'alphabet']

        if not isinstance(value, dict):
            raise serializers.ValidationError("Automata data must be a JSON object.")
        
        for key in required_keys:
            if key not in value:
                raise serializers.ValidationError(f"Automata data must contain '{key}' key.")
        
        if not isinstance(value['states'], list):
            raise serializers.ValidationError("'states' must be a list.")
        
        if len(value['states']) == 0:
            raise serializers.ValidationError("At least one state is required")
        
        return value
    
    def validate(self, data):
        # Check if user already has session with this name
        user = self.context['request'].user
        
        if SimulationSessions.objects.filter(
            user=user,
            session_name=data['session_name']
        ).exists():
            raise serializers.ValidationError({
                'name': 'You already have a session with this name'
            })
        return data
    
    def create(self, validated_data):
        logger = logging.getLogger(__name__)
        logger.info(f"Creating session: {validated_data['session_name']}")

        return SimulationSessions.objects.create(**validated_data)
    
class SimulationSessionsUpdateSerializer(serializers.ModelSerializer):

    name = serializers.CharField(required=False)
    automata_data = serializers.JSONField(required=False)
    
    class Meta:
        model = SimulationSessions
        fields = [
            'session_name',
            'description',
            'automata_type',
            'automata_data',
            'is_favorite'
        ]
    
    def update(self, instance, validated_data):

        changes = []
        
        for field, value in validated_data.items():
            if getattr(instance, field) != value:
                changes.append(field)
                setattr(instance, field, value)
        
        instance.save()
        
        # Log changes
        if changes:
            logger = logging.getLogger(__name__)
            logger.info(f"Updated session {instance.id}: {', '.join(changes)}")
        
        return instance

class SimulationSessinosHyperlinkSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = SimulationSessions
        fields = ['url', 'session_name', 'automata_type', 'user']
        extra_kwargs = {
            'url': {'view_name': 'session-detail', 'lookup_field': 'public_id'}
        }

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class SimulationSessionWithUserSerializer(serializers.ModelSerializer):
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = SimulationSessions
        fields = [
            'id',
            'name',
            'user',
            'automata_type',
            'is_editable',
            'created_at'
        ]
    
    def get_is_editable(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        return obj.user == request.user