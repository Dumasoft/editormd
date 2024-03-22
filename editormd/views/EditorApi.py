import markdown
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['POST'])
def markdown_to_html(request):
    if request.method == 'POST':
        mardown = request.data['markdown_text']
        html = markdown.markdown(mardown, extensions=['tables'])
        return Response({'html': html}, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
