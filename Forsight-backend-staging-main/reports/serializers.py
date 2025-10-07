from reports.models import ReportSttNewsGpt
from rest_framework import serializers  

class ReportSttNewsGptSerializer(serializers.ModelSerializer):
 
    class Meta:
        model = ReportSttNewsGpt
        fields = [
            'id',
            'title',
            'createdAt',
            'reportText'
           
        ]



    def create(self, validated_data):
        user = self.context.get('user')  # Fetch user from context
        if not user:
            raise serializers.ValidationError({"user": "User is required."})
        validated_data['user'] = user
        return super().create(validated_data)