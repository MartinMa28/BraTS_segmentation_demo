from django import forms
from .models import MRICase

class MRICaseForm(forms.ModelForm):
    class Meta:
        model = MRICase
        fields = ('case_id', 't1', 't1ce', 't2', 'flair')