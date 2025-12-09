from mailjet_rest import Client
from django.conf import settings
import os

class EmailService:
    def __init__(self):
        self.api_key = settings.MAILJET_API_KEY
        self.api_secret = settings.MAILJET_API_SECRET
        self.client = Client(auth=(self.api_key, self.api_secret), version='v3.1')
        self.sender_email = "noreply@tocsimulator.com"
        self.sender_name = "TOC Simulator"

    def send_verification_email(self, user_email, user_name, verification_code):
        """
        Send verification code to user.
        
        Args:
            user_email (str): Recipient email
            user_name (str): User's first name for personalization
            verification_code (str): 6-digit code
            
        Returns:
            bool: True if sent successfully
        """
        data = {
            'Messages': [
                {
                    "From": {
                        "Email": self.sender_email,
                        "Name": self.sender_name
                    },
                    "To": [
                        {
                            "Email": user_email,
                            "Name": user_name
                        }
                    ],
                    "Subject": "Verify Your Email - TOC Simulator",
                    "TextPart": f"Your verification code is: {verification_code}",
                    "HTMLPart": f"""
                        <h3>Welcome to TOC Simulator, {user_name}!</h3>
                        <p>Your verification code is:</p>
                        <h1 style="letter-spacing: 5px; color: #4F46E5;">{verification_code}</h1>
                        <p>This code will expire in 15 minutes.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    """
                }
            ]
        }
        
        try:
            result = self.client.send.create(data=data)
            return result.status_code == 200
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False