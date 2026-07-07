from django.urls import path
from .views import (
    LoginView, RegisterView, StartupListView, StartupDetailView, 
    DocumentView, DocumentDeleteView, AdminDocumentListView, AdminDocumentVerifyView
)

urlpatterns = [
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/register', RegisterView.as_view(), name='register'),
    path('startups', StartupListView.as_view(), name='startups'),
    path('startups/<uuid:pk>', StartupDetailView.as_view(), name='startup_detail'),
    path('documents', DocumentView.as_view(), name='documents'),
    path('documents/<uuid:pk>', DocumentDeleteView.as_view(), name='document_delete'),
    path('admin/documents', AdminDocumentListView.as_view(), name='admin_documents'),
    path('admin/documents/<uuid:pk>/verify', AdminDocumentVerifyView.as_view(), name='admin_verify_document'),
]
