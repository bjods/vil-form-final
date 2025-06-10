# VL Form Widget - Embedding Guide

This guide explains how to embed the VL Form widget into WordPress sites or any other website.

## Quick Start

Add this code to any webpage where you want the form to appear:

```html
<!-- VL Form Container -->
<div class="vl-form-embed">
    <p>Loading form...</p>
</div>

<!-- VL Form Embed Script -->
<script src="https://vil-form-final.vercel.app/embed.js"></script>
```

## WordPress Integration

### Method 1: HTML Block (Recommended)
1. Edit your WordPress page/post
2. Add an "HTML" block
3. Paste the embed code above
4. Publish/Update the page

### Method 2: Theme Files
Add the embed code to your theme's template files (e.g., `page.php`, `single.php`).

### Method 3: Plugin
Use a plugin like "Insert Headers and Footers" to add the script globally.

## Features

✅ **Automatic URL Tracking** - Captures source page, referrer, and URL parameters  
✅ **Supabase Backend** - All data saved to secure database  
✅ **Auto-save** - Form data saved as user types  
✅ **Multi-step Form** - Service selection, address, budget, project details  
✅ **Photo Upload** - Direct upload to Supabase Storage  
✅ **Calendly Integration** - Meeting booking functionality  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Cross-domain Compatible** - Works on any website  

## Advanced Configuration

### Custom Base URL
```html
<script>
window.VL_FORM_CONFIG = {
    baseUrl: 'https://your-custom-domain.com'
};
</script>
<script src="https://vil-form-final.vercel.app/embed.js"></script>
```

### Multiple Forms
```html
<div class="vl-form-embed" id="form-header"></div>
<div class="vl-form-embed" id="form-footer"></div>
<script src="https://vil-form-final.vercel.app/embed.js"></script>
```

### Custom Styling
```css
.vl-form-embed {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Data Tracking

The widget automatically captures:
- **Source URL**: The page where the form is embedded
- **Referrer**: The page the user came from
- **URL Parameters**: Any query parameters (e.g., `?utm_source=google`)
- **Container ID**: The HTML element ID where the form is mounted

This data is saved to the Supabase database for tracking and analytics.

## Form Flow

1. **Service Selection** - User selects services needed
2. **Address Collection** - Address and postal code
3. **Budget & Details** - Service-specific questions
4. **Personal Information** - Contact details
5. **Form Submission** - Data saved to Supabase
6. **Follow-up Options** - Photo upload, meeting booking

## Technical Details

### Files Generated
- `dist/embed.js` - Main embed script
- `dist/assets/index-[hash].js` - React application bundle
- `dist/assets/index-[hash].css` - Stylesheet

### Build Process
```bash
npm run build
```
This automatically:
1. Builds the React application
2. Generates hashed asset filenames
3. Updates `embed.js` with correct asset paths
4. Outputs everything to `dist/` directory

### Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Troubleshooting

### Form Not Loading
1. Check browser console for errors
2. Verify the embed script URL is accessible
3. Ensure the container has class `vl-form-embed`

### Styling Issues
1. Check for CSS conflicts with your site's styles
2. Add custom CSS to override if needed
3. Ensure the container has sufficient height

### Data Not Saving
1. Check browser console for Supabase errors
2. Verify environment variables are set correctly
3. Check Supabase project status

## Example Implementation

See `public/embed-example.html` for a complete working example.

## Support

For technical support or questions about embedding the form widget, please contact the development team. 