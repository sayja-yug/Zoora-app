import uuid
from django.db import models

class UserRole(models.TextChoices):
    FOUNDER = 'founder', 'Founder'
    INVESTOR = 'investor', 'Investor'
    SERVICE = 'service', 'Service'
    ADMIN = 'admin', 'Admin'

class MetricCategory(models.TextChoices):
    TECH = 'tech', 'Technology & R&D'
    CERTS = 'certs', 'Certifications & Compliance'
    MARKET = 'market', 'Market Traction'
    FUTURE = 'future', 'Future Readiness'
    TEAM = 'team', 'Team & Leadership'
    RISK = 'risk', 'Risk Deductions'

class MetricType(models.TextChoices):
    NUMERIC = 'numeric', 'Numeric'
    DOCUMENT = 'document', 'Document'
    QUALITATIVE = 'qualitative', 'Qualitative'

class ConfidenceTag(models.TextChoices):
    VERIFIED_DOC = 'verified_doc', 'Verified Doc'
    LLM_INFERRED = 'llm_inferred', 'LLM Inferred'
    SELF_REPORTED = 'self_reported', 'Self Reported'

class ParseStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PARSED = 'parsed', 'Parsed'
    FAILED = 'failed', 'Failed'

class ModelConfidenceLevel(models.TextChoices):
    HIGH = 'high', 'High'
    MEDIUM = 'medium', 'Medium'
    LOW = 'low', 'Low'

class Startup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    stage = models.TextField()
    sector = models.TextField()
    website = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_completeness_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        db_table = 'startups'
        managed = True

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.TextField(unique=True)
    password_hash = models.TextField()
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.FOUNDER)
    startup = models.ForeignKey(Startup, on_delete=models.SET_NULL, null=True, blank=True, db_column='startup_id')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        managed = True

class Metric(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.TextField(unique=True)
    category = models.CharField(max_length=20, choices=MetricCategory.choices)
    name = models.TextField()
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=MetricType.choices)
    weight = models.DecimalField(max_digits=6, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    extraction_prompt = models.TextField(null=True, blank=True)
    valid_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valid_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'metrics'
        managed = True

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, db_column='startup_id')
    file_url = models.TextField()
    doc_type = models.TextField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='uploaded_by')
    parsed_text = models.TextField(null=True, blank=True)
    parse_status = models.CharField(max_length=20, choices=ParseStatus.choices, default=ParseStatus.PENDING)
    parse_error = models.TextField(null=True, blank=True)
    parsed_at = models.DateTimeField(null=True, blank=True)
    verification_status = models.CharField(
        max_length=20,
        default='pending',
        choices=[('pending', 'Pending'), ('verified', 'Verified'), ('rejected', 'Rejected')]
    )

    class Meta:
        db_table = 'documents'
        managed = True

class MetricValue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, db_column='startup_id')
    metric = models.ForeignKey(Metric, on_delete=models.CASCADE, db_column='metric_id')
    value = models.TextField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    confidence_tag = models.CharField(max_length=20, choices=ConfidenceTag.choices, default=ConfidenceTag.SELF_REPORTED)
    source_document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, db_column='source_document_id')
    llm_rationale = models.TextField(null=True, blank=True)
    model_confidence = models.CharField(max_length=20, choices=ModelConfidenceLevel.choices, null=True, blank=True)
    llm_prompt_version = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='updated_by')

    class Meta:
        db_table = 'metric_values'
        managed = True
        unique_together = (('startup', 'metric'),)

class Score(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, db_column='startup_id')
    category = models.CharField(max_length=20, choices=MetricCategory.choices)
    raw_score = models.DecimalField(max_digits=5, decimal_places=2)
    weighted_score = models.DecimalField(max_digits=5, decimal_places=2)
    populated_metrics = models.IntegerField(default=0)
    total_metrics = models.IntegerField(default=0)
    confidence_breakdown_json = models.JSONField(default=dict)
    computed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scores'
        managed = True
        unique_together = (('startup', 'category'),)

class ScoreHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, db_column='startup_id')
    category = models.CharField(max_length=20, choices=MetricCategory.choices)
    raw_score = models.DecimalField(max_digits=5, decimal_places=2)
    weighted_score = models.DecimalField(max_digits=5, decimal_places=2)
    populated_metrics = models.IntegerField(default=0)
    total_metrics = models.IntegerField(default=0)
    confidence_breakdown_json = models.JSONField(default=dict)
    computed_at = models.DateTimeField(auto_now_add=True)
    triggered_by = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'score_history'
        managed = True
