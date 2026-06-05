from django.forms import Textarea

from django.conf import settings


class MDWidget(Textarea):
    template_name = 'editormd.html'
    configs = getattr(settings, 'MD_URL_API', None)

    def __init__(self, attrs=None):
        super(MDWidget, self).__init__(attrs=attrs)

    def get_context(self, name, value, attrs):
        context = super(MDWidget, self).get_context(name, value, attrs)
        return context

    class Media:
        css = {
            'all': [
                'editormd/css/editormd.css',
            ]
        }
        js = [
            'editormd/js/editormd.js',
        ]
