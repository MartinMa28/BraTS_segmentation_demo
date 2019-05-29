from django.db import models

# Create your models here.
class MRICase(models.Model):
    case_id = models.CharField(max_length=50, unique=True)
    t1 = models.FileField(upload_to='cases')
    t1ce = models.FileField(upload_to='cases')
    t2 = models.FileField(upload_to='cases')
    flair = models.FileField(upload_to='cases')

    def __str__(self):
        return self.case_id

    def delete(self, *args, **kwargs):
        # delete the uploaded files before calling base class's delete method
        self.t1.delete()
        self.t1ce.delete()
        self.t2.delete()
        self.flair.delete()

        super().delete(*args, **kwargs)