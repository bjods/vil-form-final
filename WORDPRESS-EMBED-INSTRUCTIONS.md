# WordPress Embed Instructions

## Quick Start - Embed Code

Add this code to any WordPress page, post, or widget where you want the form to appear:

```html
<div class="vl-form-embed"></div>
<script src="https://vil-form-final.vercel.app/embed.js"></script>
```

That's it! The form will load automatically with all features including:
- ✅ Google Maps address autocomplete
- ✅ All form pages and functionality from the original
- ✅ WhatConverts tracking compatibility
- ✅ Perfect style isolation
- ✅ Thank you page with next steps
- ✅ Optimized lightweight bundle (755KB vs previous 2MB+)

## Advanced Options

### Multiple Forms on Same Page

If you need multiple forms on the same page, give each container a unique ID:

```html
<div class="vl-form-embed" id="form-1"></div>
<div class="vl-form-embed" id="form-2"></div>
<script src="https://vil-form-final.vercel.app/embed.js"></script>
```

### Custom Styling

You can customize the form's appearance using CSS variables:

```html
<style>
  .vl-form-embed {
    --widget-width: 700px;          /* Form width */
    --widget-height: 800px;         /* Form height */
    --widget-background: #f5f5f5;   /* Background color */
    --widget-border-radius: 12px;   /* Corner roundness */
    --widget-shadow: 0 4px 20px rgba(0,0,0,0.1); /* Shadow effect */
  }
</style>

<div class="vl-form-embed"></div>
<script src="https://vil-form-final.vercel.app/embed.js"></script>
```

## WhatConverts Integration

The form is fully compatible with WhatConverts. It will:

1. Fire standard form submit events that WhatConverts can track
2. Create a hidden form with all user data during submission
3. Include these trackable fields:
   - `firstName`
   - `lastName`
   - `email`
   - `phone`
   - `address`
   - `postalCode`
   - `services`
   - `referralSource`
   - `sourceUrl` (where the form was embedded)
   - `referrer` (referring website)

### Testing WhatConverts Tracking

To verify tracking is working:

1. Open your browser's Developer Console (F12)
2. Go to the Network tab
3. Submit the form
4. Look for WhatConverts tracking requests

You can also listen for the custom event:

```javascript
window.addEventListener('vl-form-submitted', function(event) {
    console.log('Form submitted with data:', event.detail);
});
```

## WordPress Implementation Methods

### Method 1: WordPress Editor (Gutenberg)

1. Add a "Custom HTML" block
2. Paste the embed code
3. Publish or update the page

### Method 2: Classic Editor

1. Switch to "Text" mode (not Visual)
2. Paste the embed code where you want the form
3. Update the page

### Method 3: Widget Areas

1. Go to Appearance > Widgets
2. Add a "Custom HTML" widget
3. Paste the embed code
4. Save

### Method 4: Theme Template

Add to your theme's template file (e.g., `page.php`, `single.php`):

```php
<?php if (is_page('contact')) : ?>
    <div class="vl-form-embed"></div>
    <script src="https://vil-form-final.vercel.app/embed.js"></script>
<?php endif; ?>
```

### Method 5: Shortcode (Optional)

Create a shortcode in your theme's `functions.php`:

```php
function vl_form_shortcode() {
    return '<div class="vl-form-embed"></div>
            <script src="https://vil-form-final.vercel.app/embed.js"></script>';
}
add_shortcode('vl_form', 'vl_form_shortcode');
```

Then use `[vl_form]` anywhere in your content.

## Troubleshooting

### Form Not Loading

1. Check browser console for errors (F12)
2. Ensure the embed script URL is correct
3. Verify no JavaScript conflicts with theme/plugins

### Styling Issues

The form uses isolated styles to prevent conflicts. If you see styling issues:

1. Check if your theme has aggressive CSS resets
2. Use the CSS variables (shown above) to customize appearance
3. Contact support if issues persist

### Tracking Not Working

1. Ensure WhatConverts script is loaded on the page
2. Check that form submission completes successfully
3. Verify in browser console that events are firing
4. Check Network tab for tracking requests

## Security & Performance

- The form loads asynchronously and won't block page rendering
- All data is transmitted securely over HTTPS
- Form submissions are stored in a secure database
- No sensitive data is exposed in the embed code

## Support

For issues or questions about the embed implementation, please check:
- Browser console for error messages
- Network tab for failed requests
- That JavaScript is enabled in the browser