from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, EmailVerificationCodeSerializer
from .models import EmailVerificationCode
from django.utils import timezone
from django.contrib.auth import get_user_model
from .services import EmailService

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        code = user.email_verification_codes.create()
        email_service = EmailService()
        email_sent = email_service.send_verification_email(
            user_email=user.email,
            user_name=user.first_name,
            verification_code=code.code
        )
        if not email_sent:
            user.delete()
            return Response(
                {"error": "Failed to send verification email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        res_data = {
            "email": user.email,
            "message": "Registration successful. Please check your email to verify your account."
        }
        return Response(res_data, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = EmailVerificationCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        code_value = serializer.validated_data['code']
        
        try:
            # Find user
            user = User.objects.get(email=email)
            
            # Find the most recent unused, unexpired code
            verification_code = EmailVerificationCode.objects.filter(
                user=user,
                code=code_value,
                is_used=False,
                expires_at__gt=timezone.now()
            ).first()
            
            if not verification_code:
                return Response(
                    {"error": "Expired verification code"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark code as used
            verification_code.is_used = True
            verification_code.save()
            
            # Activate user
            user.is_active = True
            user.is_email_verified = True
            user.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "Email verified successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                }
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )