# BagelPicker Test Data

This directory should contain test data for the SPK onboarding process.

## NJIT Degrees Data

The `njit_degrees.json` file should be structured as an array of degree options with the following format:

```json
[
  {
    "degree_title": "B.S. Computer Science",
    "college": "College of Computing",
    "major": "Computer Science"
  },
  {
    "degree_title": "M.S. Computer Science",
    "college": "College of Computing", 
    "major": "Computer Science"
  },
  {
    "degree_title": "Online MBA Program",
    "college": "School of Management",
    "major": "Business Administration"
  }
]
```

Each degree object should include:

- `degree_title`: The full title of the degree (including B.S., M.S., Ph.D., Certificate, etc.)
- `college`: The name of the college offering the degree
- `major`: The name of the major/program

## Special Formatting Guidelines

- For online programs, include the word "Online" in the `degree_title`
- Use consistent naming for related programs (e.g., "Computer Science" rather than "CS" and "Computer Sci")
- Include the full degree type prefix (B.S., B.A., M.S., M.A., Ph.D., etc.)

## API Access

The frontend accesses this data through the `/api/onboarding/majors` endpoint, which reads from `scripts/njit_degrees.json`. 