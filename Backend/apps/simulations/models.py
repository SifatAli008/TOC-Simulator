import logging
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.forms import ValidationError
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class SimulationSessions(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='simulation_sessions',
        db_index=True
    )
    session_name = models.CharField(
        max_length=255,
        default='Untitled Session',
        help_text='Name of the simulation session'
    )
    description = models.TextField(
        blank=True,
        default='',
        help_text='Description of the simulation session'
    )

    # Restricted types of automata for simulations
    AUTOMATA_TYPES = [
        ('DFA', 'Deterministic Finite Automaton'),
        ('NFA', 'Nondeterministic Finite Automaton'),
        ('TM', 'Turing Machine'),
        ('REGEX', 'Regular Expression'),
    ]
    automata_type = models.CharField(
        max_length=10,
        choices=AUTOMATA_TYPES,
        default='DFA',
        db_index=True,
    )
    automata_data = models.JSONField(
        help_text='JSON representation of the automata configuration'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    last_accessed_at = models.DateTimeField(auto_now=True, db_index=True)

    # Flags
    is_shared = models.BooleanField(default=False)
    is_favorite = models.BooleanField(default=False, db_index=True)

    # Secure IDs for sharing
    public_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text='Public identifier for sharing sessions'
    )
    class Meta:
        db_table = 'simulation_sessions'
        ordering = ['-last_accessed_at']
        verbose_name = 'Simulation Session'
        verbose_name_plural = 'Simulation Sessions'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_favorite']),
        ]
        constrints = [
            models.UniqueConstraint(
                fields=['user', 'session_name'],
                name='unique_session_name_per_user'
            )
        ]
        permissions = [
            ('can_share_session', 'Can share sesstion with others'),
            ('can_view_others_sessions', 'Can view sessions shared by others'),
        ]

    def __str__(self):
        return f"{self.session_name} ({self.get_automata_type_display()})"
    
    def __repr__(self):
        return f"<SimulationSessions id={self.id} user={self.user.email} type={self.automata_type}>"
    
    def clean(self):
        super().clean()
        if not isinstance(self.automata_data, dict):
            raise ValidationError('automata_data must be a valid JSON object')
        if 'states' not in self.automata_data:
            raise ValidationError('automata_data must contain states information')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        logger = logging.getLogger(__name__)
        logger.info(f"Deleting SimulationSession id={self.id} user={self.user.email}")
        super().delete(*args, **kwargs)
    
    # Business logic methods

    def duplicate(self, new_name=None):
        """
        Create a duplicate of the current simulation session.
        """
        duplicate_session = SimulationSessions.objects.create(
            user=self.user,
            session_name=new_name or f"{self.session_name} (Copy)",
            description=self.description,
            automata_type=self.automata_type,
            automata_data=self.automata_data,
            is_shared=False,
            is_favorite=False
        )
        return duplicate_session
    @property
    def state_count(self):
        """
        Return the number of states in the automata.
        """
        return len(self.automata_data.get('states', []))
    
    @property
    def transition_count(self):
        """
        Return the number of transitions in the automata.
        """
        return len(self.automata_data.get('transitions', []))
    
    @property
    def is_recent(self):
        """
        Check if the session was accessed in the last 7 days.
        """
        return self.last_accessed_at >= timezone.now() - timedelta(days=7)

class SimulationRun(models.Model):
    session = models.ForeignKey(
        SimulationSessions,
        on_delete=models.CASCADE,
        related_name='runs'
    )

    input_string = models.CharField(
        max_length=1000,
        help_text='The input string tested'
    )
    
    is_accepted = models.BooleanField(
        help_text='Whether the automaton accepted this input'
    )
    
    execution_time = models.FloatField(
        help_text='Execution time in milliseconds'
    )
    
    result_steps = models.JSONField(
        help_text='Step-by-step simulation trace'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'simulation_runs'
        ordering = ['-created_at']
        verbose_name = 'Simulation Run'
        verbose_name_plural = 'Simulation Runs'
        indexes = [
            models.Index(fields=['session', '-created_at'])
        ]

    def __str__(self):
        status = "✓" if self.is_accepted else "✗"
        return f"{status} '{self.input_string}' on {self.session.session_name}"
    
    