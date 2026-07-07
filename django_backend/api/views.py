import jwt
import datetime
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, Startup, UserRole, Document
import uuid

def generate_jwt(user):
    payload = {
        'userId': str(user.id),
        'role': user.role,
        'email': user.email,
        'startupId': str(user.startup_id) if user.startup_id else None,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # In a real app we'd use bcrypt or django.contrib.auth.hashers
        # For this port, we emulate the simplified behavior
        try:
            user = User.objects.get(email=email)
            if user.password_hash != password: # Simplified password check
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = generate_jwt(user)
            return Response({
                'token': token,
                'user': {
                    'userId': str(user.id),
                    'role': user.role,
                    'email': user.email,
                    'startupId': str(user.startup_id) if user.startup_id else None
                }
            })
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'founder')
        
        if role == 'founder':
            startup_name = request.data.get('startupName')
            startup_stage = request.data.get('startupStage')
            startup_sector = request.data.get('startupSector')
            
            startup = Startup.objects.create(
                name=startup_name,
                stage=startup_stage,
                sector=startup_sector
            )
            user = User.objects.create(
                email=email,
                password_hash=password, # Simplified
                role=UserRole.FOUNDER,
                startup=startup
            )
        else:
            user = User.objects.create(
                email=email,
                password_hash=password,
                role=UserRole.INVESTOR
            )

        token = generate_jwt(user)
        return Response({
            'token': token,
            'user': {
                'userId': str(user.id),
                'role': user.role,
                'email': user.email,
                'startupId': str(user.startup_id) if user.startup_id else None
            }
        })

class StartupListView(APIView):
    def get(self, request):
        startups = Startup.objects.all()
        # Simplified serialization
        data = []
        for s in startups:
            data.append({
                'id': str(s.id),
                'name': s.name,
                'stage': s.stage,
                'sector': s.sector,
                'profile_completeness_pct': float(s.profile_completeness_pct),
                'created_at': s.created_at.isoformat(),
            })
        return Response(data)

class StartupDetailView(APIView):
    def get(self, request, pk):
        try:
            startup = Startup.objects.get(pk=pk)
            return Response({
                'startup': {
                    'id': str(startup.id),
                    'name': startup.name,
                    'stage': startup.stage,
                    'sector': startup.sector,
                    'profile_completeness_pct': float(startup.profile_completeness_pct),
                },
                'scores': [],
                'score_history': []
            })
        except Startup.DoesNotExist:
            return Response({'error': 'Startup not found'}, status=status.HTTP_404_NOT_FOUND)

class DocumentView(APIView):
    def get(self, request):
        startup_id = request.query_params.get('startup_id')
        if not startup_id:
            return Response({'error': 'startup_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        docs = Document.objects.filter(startup_id=startup_id)
        data = []
        for d in docs:
            data.append({
                'id': str(d.id),
                'startup_id': str(d.startup_id),
                'file_url': d.file_url,
                'doc_type': d.doc_type,
                'uploaded_at': d.uploaded_at.isoformat(),
                'parse_status': d.parse_status,
                'filename': d.file_url.split('/')[-1] if '/' in d.file_url else d.file_url
            })
        return Response({'documents': data})

    def post(self, request):
        import boto3
        startup_id = request.data.get('startup_id')
        doc_type = request.data.get('doc_type')
        filename = request.data.get('filename')
        
        s3 = boto3.client('s3', endpoint_url='http://localhost:9000',
                          aws_access_key_id='zoora_minio_admin',
                          aws_secret_access_key='zoora_local_dev_2024')
        
        object_key = f"{startup_id}/{doc_type}/{uuid.uuid4()}_{filename}"
        
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={'Bucket': 'zoora-docs', 'Key': object_key},
            ExpiresIn=3600
        )
        
        return Response({
            'upload_url': presigned_url,
            'object_key': object_key
        })

class DocumentDeleteView(APIView):
    def delete(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            # In a real app we'd also delete the S3 object in MinIO
            doc.delete()
            return Response({'success': True})
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminDocumentListView(APIView):
    def get(self, request):
        docs = Document.objects.all().select_related('startup', 'uploaded_by')
        data = []
        for d in docs:
            data.append({
                'id': str(d.id),
                'startup_id': str(d.startup_id),
                'startup_name': d.startup.name if d.startup else "Unknown",
                'file_url': d.file_url,
                'doc_type': d.doc_type,
                'uploaded_at': d.uploaded_at.isoformat(),
                'uploaded_by_email': d.uploaded_by.email if d.uploaded_by else "System",
                'parse_status': d.parse_status,
                'verification_status': d.verification_status,
                'filename': d.file_url.split('/')[-1] if '/' in d.file_url else d.file_url,
                'parsed_text': d.parsed_text
            })
        return Response({'documents': data})

class AdminDocumentVerifyView(APIView):
    def post(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            action = request.data.get('action') # 'verify' or 'reject'
            if action == 'verify':
                doc.verification_status = 'verified'
            elif action == 'reject':
                doc.verification_status = 'rejected'
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
            doc.save()
            return Response({
                'id': str(doc.id),
                'verification_status': doc.verification_status
            })
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
