# Formlytics API Documentation

This document describes how to use the Formlytics API to submit form data programmatically without using the embedded form interface.

## Overview

The Formlytics API allows you to submit form data directly from your own applications, websites, or scripts. This is useful when you want to:

- Integrate form submissions into your existing workflow
- Submit data from mobile apps
- Automate form submissions
- Create custom frontend interfaces
- Integrate with third-party services

## API Endpoints

### Submit Form Data

**Endpoint:** `POST /api/forms/{formId}/submit`

**Description:** Submit form data programmatically

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": {
    "fieldId1": "value1",
    "fieldId2": "value2",
    "fieldId3": ["option1", "option2"]
  },
  "metadata": {
    "source": "api",
    "version": "1.0"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "entryId": "entry_123456789",
  "message": "Form submitted successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    "Field 'Email' is required",
    "Field 'Name' must be a valid email address"
  ]
}
```

### Get Form Schema

**Endpoint:** `GET /api/forms/{formId}/submit`

**Description:** Retrieve form schema and field information for API documentation

**Success Response (200):**
```json
{
  "formId": "cm123abc456def",
  "title": "Contact Form",
  "description": "Get in touch with us",
  "isMultistep": false,
  "allowMultipleSubmissions": true,
  "schema": [
    {
      "id": "name",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "required": true,
      "width": "half"
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "Enter your email",
      "required": true,
      "width": "half"
    }
  ],
  "apiEndpoint": "/api/forms/cm123abc456def/submit",
  "exampleRequest": {
    "method": "POST",
    "url": "/api/forms/cm123abc456def/submit",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "data": {
        "name": "Sample Full Name",
        "email": "user@example.com"
      },
      "metadata": {
        "source": "api",
        "version": "1.0"
      }
    }
  }
}
```

## Field Types and Validation

### Text Fields
- **Type:** `text`
- **Value:** String
- **Example:** `"John Doe"`

### Email Fields
- **Type:** `email`
- **Value:** String (must be valid email)
- **Example:** `"user@example.com"`

### Textarea Fields
- **Type:** `textarea`
- **Value:** String
- **Example:** `"This is a longer message..."`

### Number Fields
- **Type:** `number`
- **Value:** Number
- **Example:** `123`

### Date Fields
- **Type:** `date`
- **Value:** String (YYYY-MM-DD format)
- **Example:** `"2024-01-01"`

### Select Fields
- **Type:** `select`
- **Value:** String (must be one of the options)
- **Example:** `"Option 1"`

### Radio Fields
- **Type:** `radio`
- **Value:** String (must be one of the options)
- **Example:** `"Option 1"`

### Multiselect Fields
- **Type:** `multiselect`
- **Value:** Array of strings
- **Example:** `["Option 1", "Option 2"]`

### Multi-dropdown Fields
- **Type:** `multi-dropdown`
- **Value:** Array of strings
- **Example:** `["Option 1", "Option 2"]`

### Checkbox Fields
- **Type:** `checkbox`
- **Value:** Boolean
- **Example:** `true`

## Code Examples

### cURL
```bash
curl -X POST "https://your-domain.com/api/forms/cm123abc456def/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "message": "Hello from API!"
    },
    "metadata": {
      "source": "api",
      "version": "1.0"
    }
  }'
```

### JavaScript (Fetch)
```javascript
const formData = {
  data: {
    name: "John Doe",
    email: "john.doe@example.com",
    message: "Hello from API!"
  },
  metadata: {
    source: "api",
    version: "1.0"
  }
};

fetch('https://your-domain.com/api/forms/cm123abc456def/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Form submitted successfully:', data.entryId);
  } else {
    console.error('Error:', data.error, data.details);
  }
})
.catch(error => console.error('Network error:', error));
```

### Python (requests)
```python
import requests
import json

url = 'https://your-domain.com/api/forms/cm123abc456def/submit'
data = {
    'data': {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'message': 'Hello from API!'
    },
    'metadata': {
        'source': 'api',
        'version': '1.0'
    }
}

response = requests.post(url, json=data)

if response.status_code == 200:
    result = response.json()
    print(f"Form submitted successfully: {result['entryId']}")
else:
    error = response.json()
    print(f"Error: {error['error']}")
    if 'details' in error:
        for detail in error['details']:
            print(f"  - {detail}")
```

### PHP
```php
<?php
$url = 'https://your-domain.com/api/forms/cm123abc456def/submit';
$data = [
    'data' => [
        'name' => 'John Doe',
        'email' => 'john.doe@example.com',
        'message' => 'Hello from API!'
    ],
    'metadata' => [
        'source' => 'api',
        'version' => '1.0'
    ]
];

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result !== false) {
    $response = json_decode($result, true);
    if ($response['success']) {
        echo "Form submitted successfully: " . $response['entryId'];
    } else {
        echo "Error: " . $response['error'];
    }
} else {
    echo "Request failed";
}
?>
```

### Laravel (PHP Framework)
```php
<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class FormlyticsController extends Controller
{
    public function submitForm(Request $request)
    {
        $formId = 'cm123abc456def'; // Replace with your form ID
        $apiUrl = "https://your-domain.com/api/forms/{$formId}/submit";
        
        $formData = [
            'data' => [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'message' => $request->input('message'),
                'phone' => $request->input('phone'),
                'company' => $request->input('company'),
                'interests' => $request->input('interests', []), // Array for multiselect
                'newsletter' => $request->boolean('newsletter'), // Boolean for checkbox
                'eventDate' => $request->input('eventDate'), // Date field
            ],
            'metadata' => [
                'source' => 'laravel-api',
                'version' => '1.0',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'User-Agent' => 'Laravel-Formlytics-Client/1.0'
            ])->post($apiUrl, $formData);

            if ($response->successful()) {
                $result = $response->json();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Form submitted successfully',
                    'entry_id' => $result['entryId']
                ]);
            } else {
                $error = $response->json();
                
                return response()->json([
                    'success' => false,
                    'error' => $error['error'] ?? 'Unknown error',
                    'details' => $error['details'] ?? []
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Network error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Alternative using Guzzle HTTP client
    public function submitFormWithGuzzle(Request $request)
    {
        $formId = 'cm123abc456def';
        $apiUrl = "https://your-domain.com/api/forms/{$formId}/submit";
        
        $client = new \GuzzleHttp\Client();
        
        $formData = [
            'data' => [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'message' => $request->input('message'),
            ],
            'metadata' => [
                'source' => 'laravel-guzzle',
                'version' => '1.0'
            ]
        ];

        try {
            $response = $client->post($apiUrl, [
                'json' => $formData,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'Laravel-Guzzle-Client/1.0'
                ]
            ]);

            $result = json_decode($response->getBody(), true);
            
            return response()->json([
                'success' => true,
                'entry_id' => $result['entryId']
            ]);
            
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $response = $e->getResponse();
            $error = json_decode($response->getBody(), true);
            
            return response()->json([
                'success' => false,
                'error' => $error['error'] ?? 'Request failed',
                'details' => $error['details'] ?? []
            ], $response->getStatusCode());
        }
    }

    // Service class approach (recommended for larger applications)
    public function submitFormViaService(Request $request)
    {
        $formlyticsService = new FormlyticsService();
        
        $result = $formlyticsService->submitForm('cm123abc456def', [
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'message' => $request->input('message'),
        ]);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'entry_id' => $result['entryId']
            ]);
        } else {
            return response()->json([
                'success' => false,
                'error' => $result['error'],
                'details' => $result['details'] ?? []
            ], 400);
        }
    }
}

// Service class
class FormlyticsService
{
    private $baseUrl;
    private $httpClient;

    public function __construct()
    {
        $this->baseUrl = config('formlytics.base_url', 'https://your-domain.com');
        $this->httpClient = Http::withHeaders([
            'Content-Type' => 'application/json',
            'User-Agent' => 'Laravel-Formlytics-Service/1.0'
        ]);
    }

    public function submitForm(string $formId, array $data, array $metadata = [])
    {
        $apiUrl = "{$this->baseUrl}/api/forms/{$formId}/submit";
        
        $payload = [
            'data' => $data,
            'metadata' => array_merge([
                'source' => 'laravel-service',
                'version' => '1.0',
                'timestamp' => now()->toISOString(),
            ], $metadata)
        ];

        try {
            $response = $this->httpClient->post($apiUrl, $payload);
            
            if ($response->successful()) {
                return $response->json();
            } else {
                $error = $response->json();
                return [
                    'success' => false,
                    'error' => $error['error'] ?? 'Unknown error',
                    'details' => $error['details'] ?? []
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Network error',
                'message' => $e->getMessage()
            ];
        }
    }

    public function getFormSchema(string $formId)
    {
        $apiUrl = "{$this->baseUrl}/api/forms/{$formId}/submit";
        
        try {
            $response = $this->httpClient->get($apiUrl);
            
            if ($response->successful()) {
                return $response->json();
            } else {
                return [
                    'success' => false,
                    'error' => 'Failed to fetch form schema'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Network error',
                'message' => $e->getMessage()
            ];
        }
    }
}
```

### Laravel Routes
```php
// routes/web.php or routes/api.php
Route::post('/submit-formlytics-form', [FormlyticsController::class, 'submitForm']);
Route::post('/submit-formlytics-guzzle', [FormlyticsController::class, 'submitFormWithGuzzle']);
Route::post('/submit-formlytics-service', [FormlyticsController::class, 'submitFormViaService']);
```

### Laravel Configuration
```php
// config/formlytics.php
return [
    'base_url' => env('FORMLYTICS_BASE_URL', 'https://your-domain.com'),
    'timeout' => env('FORMLYTICS_TIMEOUT', 30),
    'retry_attempts' => env('FORMLYTICS_RETRY_ATTEMPTS', 3),
];
```

### Environment Variables (.env)
```env
FORMLYTICS_BASE_URL=https://your-domain.com
FORMLYTICS_TIMEOUT=30
FORMLYTICS_RETRY_ATTEMPTS=3
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
- **Invalid request body:** Missing or malformed JSON
- **Validation failed:** Field validation errors
- **Multiple submissions not allowed:** Form doesn't allow multiple submissions

#### 404 Not Found
- **Form not found:** Invalid form ID or form is inactive

#### 500 Internal Server Error
- **Server error:** Unexpected server-side error

### Validation Errors

The API performs comprehensive validation on submitted data:

1. **Required field validation:** All required fields must be provided
2. **Type validation:** Field values must match expected types
3. **Format validation:** Email addresses, dates, etc. must be properly formatted
4. **Option validation:** Select/radio/multiselect values must be from allowed options

## Multiple Submission Security

Formlytics includes built-in security features to prevent duplicate submissions and ensure data integrity:

### Multiple Submission Control
- **Setting**: Forms can be configured to allow or disallow multiple submissions
- **Default**: Multiple submissions are disabled by default
- **Detection**: Uses IP address tracking to identify duplicate submissions
- **Scope**: Applies to both API submissions and frontend form submissions

### IP Address Tracking
- **Headers Checked**: `x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`
- **Storage**: IP addresses are stored in submission metadata
- **Privacy**: IP addresses are only used for duplicate detection

### Metadata Collection
All submissions include automatic metadata collection:
```json
{
  "_metadata": {
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "source": "api|public_form|embed_form",
    "referrer": "https://example.com"
  }
}
```

### Error Responses
When multiple submissions are blocked:
```json
{
  "error": "Multiple submissions not allowed for this form",
  "details": "A submission from this IP address already exists"
}
```

### Client Information API

Get client information for enhanced security tracking:

**Endpoint**: `GET /api/client-info`

**Response**:
```json
{
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://example.com",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Rate Limiting

Currently, there are no rate limits imposed on the API endpoints. However, this may change in future versions.

## Security Considerations

1. **Form Access:** Only active forms can receive submissions
2. **Data Validation:** All submitted data is validated against the form schema
3. **Metadata Tracking:** User agent, IP address, and custom metadata are stored with submissions
4. **No Authentication Required:** The API is designed for public form submissions

## Testing

Use the provided test script to test your API integration:

```bash
node test-api.js <form-id> <base-url>
```

Example:
```bash
node test-api.js cm123abc456def https://your-domain.com
```

## Getting Form Schema

To get the exact field IDs and structure for your form, use the GET endpoint:

```bash
curl "https://your-domain.com/api/forms/cm123abc456def/submit"
```

This will return the complete form schema including field IDs, types, validation rules, and example values.

## Integration Tips

1. **Always fetch the form schema first** to get the correct field IDs and validation rules
2. **Handle errors gracefully** - check response status codes and error messages
3. **Include metadata** to track the source of submissions
4. **Test with sample data** before implementing in production
5. **Respect form settings** - check if multiple submissions are allowed

## Support

For API support and questions, please refer to the Formlytics documentation or contact support.
