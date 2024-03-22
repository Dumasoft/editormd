from django.forms import Textarea

from bookriders.settings import settings


class MDWidget(Textarea):
    template_name = 'editormd.html'

    def __init__(self, attrs=None):
        super(MDWidget, self).__init__(attrs=attrs)

    def get_context(self, name, value, attrs):
        context = super(MDWidget, self).get_context(name, value, attrs)
        context['url'] = f'{settings.BASE_URL}editor/api/v1/md_to_html'
        return context

    class Media:
        css = {
            'all': [
                # 'css/editormd.min.css',
            ]
        }
