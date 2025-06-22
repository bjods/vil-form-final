#!/bin/bash

# Deploy Gravity Forms Webhook to Supabase
# Make sure you have the Supabase CLI installed and authenticated

echo "🚀 Deploying Gravity Forms webhook to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy the edge function
echo "📦 Deploying edge function..."
supabase functions deploy gravity-forms-webhook --project-ref fkrfpgbdgdxfgzxkiuoe

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎯 Your webhook URL is:"
    echo "https://furekgiahpuetskjtkaj.supabase.co/functions/v1/gravity-forms-webhook"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure your Gravity Forms webhook with the URL above"
    echo "2. Set the request method to POST"
    echo "3. Set the request format to JSON"
    echo "4. Test with a form submission"
    echo ""
    echo "🧪 You can test the webhook with:"
    echo "node test-gravity-webhook.js"
else
    echo "❌ Deployment failed. Please check your Supabase CLI configuration."
    exit 1
fi 