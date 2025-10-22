#!/usr/bin/env node

/**
 * Test script for Formlytics API endpoint
 * 
 * This script demonstrates how to submit form data programmatically
 * to a Formlytics form using the API endpoint.
 * 
 * Usage:
 *   node test-api.js <form-id> <base-url>
 * 
 * Example:
 *   node test-api.js cm123abc456def https://your-domain.com
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node test-api.js <form-id> [base-url]');
  console.error('Example: node test-api.js cm123abc456def https://your-domain.com');
  process.exit(1);
}

const formId = args[0];
const baseUrl = args[1] || 'http://localhost:3000';
const apiUrl = `${baseUrl}/api/forms/${formId}/submit`;

// Sample form data - replace with actual form fields
const sampleData = {
  data: {
    // Replace these with actual field IDs from your form
    name: "John Doe",
    email: "john.doe@example.com",
    message: "This is a test submission via API",
    phone: "+1-555-123-4567",
    company: "Acme Corp",
    // For multiselect fields, use arrays
    interests: ["Technology", "Business"],
    // For checkbox fields, use boolean
    newsletter: true,
    // For date fields, use YYYY-MM-DD format
    eventDate: "2024-12-31"
  },
  metadata: {
    source: "api-test",
    version: "1.0",
    testRun: true
  }
};

// Parse URL to determine protocol
const url = new URL(apiUrl);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const postData = JSON.stringify(sampleData);

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Formlytics-API-Test/1.0'
  }
};

console.log('🚀 Testing Formlytics API Endpoint');
console.log('=====================================');
console.log(`Form ID: ${formId}`);
console.log(`API URL: ${apiUrl}`);
console.log(`Sample Data:`);
console.log(JSON.stringify(sampleData, null, 2));
console.log('\n📤 Sending request...\n');

const req = client.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('📥 Response Headers:');
    console.log(JSON.stringify(res.headers, null, 2));
    
    try {
      const response = JSON.parse(responseData);
      console.log('\n📥 Response Body:');
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ Success! Form submitted successfully.');
        console.log(`Entry ID: ${response.entryId}`);
      } else {
        console.log('\n❌ Error occurred:');
        console.log(`Error: ${response.error}`);
        if (response.details) {
          console.log('Details:');
          response.details.forEach(detail => console.log(`  - ${detail}`));
        }
      }
    } catch (error) {
      console.log('\n📥 Raw Response:');
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request failed:');
  console.error(error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.error('\n💡 Tip: Make sure the base URL is correct and the server is running.');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Tip: Make sure the server is running on the specified port.');
  }
});

req.write(postData);
req.end();

// Also test the GET endpoint to fetch form schema
console.log('\n🔍 Testing GET endpoint to fetch form schema...\n');

const getOptions = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'GET',
  headers: {
    'User-Agent': 'Formlytics-API-Test/1.0'
  }
};

const getReq = client.request(getOptions, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`📥 GET Response Status: ${res.statusCode} ${res.statusMessage}`);
    
    try {
      const response = JSON.parse(responseData);
      console.log('\n📋 Form Schema:');
      console.log(`Title: ${response.title}`);
      console.log(`Description: ${response.description || 'No description'}`);
      console.log(`Type: ${response.isMultistep ? 'Multi-step' : 'Single-step'}`);
      console.log(`Multiple Submissions: ${response.allowMultipleSubmissions ? 'Allowed' : 'Not Allowed'}`);
      
      if (response.schema) {
        console.log('\n📝 Form Fields:');
        if (response.isMultistep) {
          response.schema.forEach((step, index) => {
            console.log(`  Step ${index + 1}: ${step.title}`);
            step.fields.forEach(field => {
              console.log(`    - ${field.label} (${field.id}): ${field.type} ${field.required ? '[Required]' : '[Optional]'}`);
            });
          });
        } else {
          response.schema.forEach(field => {
            console.log(`  - ${field.label} (${field.id}): ${field.type} ${field.required ? '[Required]' : '[Optional]'}`);
          });
        }
      }
      
      console.log('\n💡 Use this information to update the sample data in this script.');
    } catch (error) {
      console.log('\n📥 Raw GET Response:');
      console.log(responseData);
    }
  });
});

getReq.on('error', (error) => {
  console.error('\n❌ GET request failed:');
  console.error(error.message);
});

getReq.end();
