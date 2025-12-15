from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SimulationSessionsViewSet, SimulationRunViewSet

router = DefaultRouter()

router.register(
    r'sessions',
    SimulationSessionsViewSet,
    basename='simulation-session'
)

router.register(
    r'runs',
    SimulationRunViewSet,
    basename='simulation-run'
)

urlpatterns = [
    path('', include(router.urls)),
]