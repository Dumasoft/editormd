from django import forms
from django.db import models

from editormd.widgets import MDWidget


class MDFormField(forms.fields.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.update({
            'widget': MDWidget(),
        })

        super(MDFormField, self).__init__(*args, **kwargs)


class MDField(models.TextField):
    def __init__(self, *args, **kwargs):
        super(MDField, self).__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        defaults = {
            'form_class': MDFormField,
        }
        defaults.update(kwargs)
        return super(MDField, self).formfield(**defaults)
