from django.db import models

# Create your models here.
class MRICase(models.Model):
    case_id = models.CharField(max_length=50)
    t1 = models.FileField(upload_to='cases')
    t1ce = models.FileField(upload_to='cases')
    t2 = models.FileField(upload_to='cases')
    flair = models.FileField(upload_to='cases')

    def __str__(self):
        return self.case_id