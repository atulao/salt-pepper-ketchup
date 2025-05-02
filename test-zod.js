try {
  const zod = require('zod');
  console.log('Zod loaded successfully:', !!zod);
  
  // Test creating a schema
  const testSchema = zod.object({
    name: zod.string(),
    age: zod.number(),
  });
  
  // Test parsing data
  const testResult = testSchema.safeParse({
    name: "Test User",
    age: 30
  });
  
  console.log('Validation succeeded:', testResult.success);
  console.log('Parsed data:', testResult.data);
  
} catch (error) {
  console.error('Error loading or using zod:', error);
} 