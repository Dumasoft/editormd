from django.forms import Textarea

from django.conf import settings

from editormd.configs import MD_URL_API


class MDWidget(Textarea):
    template_name = 'editormd.html'
    configs = getattr(settings, 'MD_URL_API', None)

    def __init__(self, attrs=None):
        super(MDWidget, self).__init__(attrs=attrs)

    def get_context(self, name, value, attrs):
        context = super(MDWidget, self).get_context(name, value, attrs)
        context['url'] = f'{MD_URL_API}editor/api/v1/md_to_html'
        return context

    class Media:
        css = {
            'all': [
                # 'css/editormd.min.css',
            ]
        }
