import { NextResponse } from 'next/server';

// Category descriptions for tooltips
const categoryDescriptions = {
  "Academic & Scholastic": "Course-based clubs, honor cohorts, tutoring, and academic competitions",
  "Arts, Music & Media": "Dance, music, theatre, art, creative writing, and campus media",
  "Career & Industry": "Profession-focused organizations, networking, and résumé builders",
  "Civic Engagement & Advocacy": "Sustainability, DEI, political or social-issue activism",
  "Cultural & Identity-Based": "Ethnicity, nationality, affinity, and LGBTQ+ communities",
  "Engineering": "Project/design teams and engineering-focused organizations",
  "Greek Life": "Social, service, professional Greek chapters and councils",
  "Health & Well-Being": "Physical/mental health, fitness, and health-science pre-professions",
  "Hobbies & Leisure": "Casual interests, gaming, cooking, crafts, and book clubs",
  "Honor Societies": "Discipline or GPA-based honor groups",
  "Recreation & Sports": "Sport clubs, outdoor/adventure activities, and gaming/esports",
  "Residence Life": "Hall councils, RHA, and desk operations",
  "Service & Philanthropy": "Volunteer corps, humanitarian efforts, and STEM outreach",
  "Spiritual & Religious": "Faith-based organizations and campus ministries",
  "Student Governance & Councils": "Senate, SAC, class boards, GSA, and academic councils",
  "University Services": "Official NJIT departments and offices (non-student-run)",
  "Women-led": "Organizations that center women in their mission or provide support to women-identifying students",
  "Other / Needs Review": "Organizations that don't clearly fit other categories"
};

// The complete mapping of organizations to their categories based on the master roster
const organizationCategories = [
  // Engineering - Special focus tag
  {"name":"American Institute of Chemical Engineers","tags":["Engineering","Academic & Scholastic"]},
  {"name":"American Society of Mechanical Engineers","tags":["Engineering","Academic & Scholastic"]},
  {"name":"American Society of Heating, Refrigerating, and Air-Conditioning Engineers","tags":["Engineering","Academic & Scholastic"]},
  {"name":"Arab American Association of Engineers and Architects","tags":["Engineering","Cultural & Identity-Based"]},
  {"name":"Engineers Without Borders","tags":["Engineering","Service & Philanthropy"]},
  {"name":"Graduate Biomedical Engineering Society","tags":["Engineering","Academic & Scholastic"]},
  {"name":"NJIT Biomedical Engineering Society","tags":["Engineering","Academic & Scholastic"]},
  {"name":"Institute of Electrical and Electronics Engineers","tags":["Engineering","Academic & Scholastic","Career & Industry"]},
  {"name":"Graduate Society of Women Engineers","tags":["Engineering","Career & Industry","Women-led"]},
  {"name":"Society of Women Engineers","tags":["Engineering","Career & Industry","Women-led"]},
  {"name":"Society of Hispanic Professional Engineers","tags":["Engineering","Cultural & Identity-Based","Career & Industry"]},
  {"name":"National Society of Black Engineers","tags":["Engineering","Cultural & Identity-Based","Career & Industry"]},
  {"name":"Genetically Engineered Machines","tags":["Engineering","Academic & Scholastic"]},
  {"name":"Highlander Racing","tags":["Engineering","Recreation & Sports"]},
  {"name":"Prosthetics Club","tags":["Engineering","Service & Philanthropy"]},
  {"name":"Robotics Club","tags":["Engineering","Hobbies & Leisure"]},
  {"name":"Rocketry Club","tags":["Engineering","Recreation & Sports"]},
  {"name":"SAE Aero Design Team","tags":["Engineering","Recreation & Sports"]},
  {"name":"Tikkun Olam Makers","tags":["Engineering","Service & Philanthropy"]},
  
  // Academic & Scholastic
  {"name":"Albert Dorman Honors College","tags":["Academic & Scholastic"]},
  {"name":"American Chemical Society","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"American Water Works Association Student Chapter","tags":["Academic & Scholastic"]},
  {"name":"Association for Computing Machinery","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Data Science Club","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Finance and Actuarial Society","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Financial Technology Club","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Forensic Science Student Association","tags":["Academic & Scholastic"]},
  {"name":"Geoscience and Remote Sensing Society","tags":["Academic & Scholastic"]},
  {"name":"Google Developer Student Club","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Graduate Women in Computing Society","tags":["Academic & Scholastic","Career & Industry","Women-led"]},
  {"name":"Industrial Designers Society of America","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"International Game Developers Association","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"International Interior Design Association","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Material Advantage of NJIT, Student Chapter","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Model United Nations Club","tags":["Academic & Scholastic"]},
  {"name":"NJIT Information & Cybersecurity Club","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"NJIT Special Interest Group on Computer–Human Interaction","tags":["Academic & Scholastic","Hobbies & Leisure"]},
  {"name":"PCI Student Chapter","tags":["Engineering","Academic & Scholastic"]},
  {"name":"PhD Club","tags":["Academic & Scholastic"]},
  {"name":"Pre-Dental Society","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Pre-Health Society","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Pre-Law Society","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Professional Women in Construction NJ Student Chapter","tags":["Career & Industry","Women-led"]},
  {"name":"Programming Team","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Society of Physics Students","tags":["Academic & Scholastic"]},
  {"name":"YWCC Mentoring Program","tags":["Academic & Scholastic","Career & Industry"]},
  
  // Arts, Music & Media
  {"name":"Art Club","tags":["Arts, Music & Media"]},
  {"name":"Ehsaas Dance Team","tags":["Arts, Music & Media","Cultural & Identity-Based"]},
  {"name":"GigaBeats","tags":["Arts, Music & Media"]},
  {"name":"Highlander Pep Band","tags":["Arts, Music & Media","Recreation & Sports"]},
  {"name":"NJIT Dance Team","tags":["Arts, Music & Media","Recreation & Sports"]},
  {"name":"NJIT TEP & USITT STUDENT CHAPTER","tags":["Arts, Music & Media"]},
  {"name":"NJIT Thillana","tags":["Arts, Music & Media","Cultural & Identity-Based"]},
  {"name":"Nucleus Yearbook","tags":["Arts, Music & Media"]},
  {"name":"Saavan","tags":["Arts, Music & Media","Cultural & Identity-Based"]},
  {"name":"SIGGRAPH","tags":["Arts, Music & Media","Academic & Scholastic"]},
  {"name":"Society of Musical Arts","tags":["Arts, Music & Media"]},
  {"name":"The Minerva (NJIT Creative Writing Club)","tags":["Arts, Music & Media","Hobbies & Leisure"]},
  {"name":"The Vector Newspaper","tags":["Arts, Music & Media"]},
  {"name":"Theatre Arts & Technology Program","tags":["Arts, Music & Media","University Services"]},
  {"name":"Transect","tags":["Arts, Music & Media"]},
  {"name":"WJTB Radio","tags":["Arts, Music & Media"]},
  {"name":"NJIT Community Chorus","tags":["Arts, Music & Media"]},
  
  // Civic Engagement & Advocacy
  {"name":"Black Student Union","tags":["Civic Engagement & Advocacy","Cultural & Identity-Based"]},
  {"name":"Girl Up","tags":["Civic Engagement & Advocacy","Women-led"]},
  {"name":"Graduates for Inclusion, Diversity, and Equity","tags":["Civic Engagement & Advocacy"]},
  {"name":"Habitat for Humanity","tags":["Civic Engagement & Advocacy","Service & Philanthropy"]},
  {"name":"NJIT Green","tags":["Civic Engagement & Advocacy"]},
  {"name":"NJIT OUT","tags":["Civic Engagement & Advocacy","Cultural & Identity-Based"]},
  {"name":"Office of Inclusive Excellence","tags":["University Services","Civic Engagement & Advocacy","Women-led"]},
  {"name":"Office of Sustainability","tags":["University Services","Civic Engagement & Advocacy"]},
  {"name":"Students for Hunger Relief","tags":["Civic Engagement & Advocacy","Service & Philanthropy"]},
  {"name":"United Mission for Relief & Development","tags":["Civic Engagement & Advocacy","Service & Philanthropy"]},
  {"name":"Veteran Student Organization","tags":["Civic Engagement & Advocacy"]},
  {"name":"Women in Computing Society","tags":["Career & Industry","Civic Engagement & Advocacy","Women-led"]},
  
  // Cultural & Identity-Based
  {"name":"African Students Association","tags":["Cultural & Identity-Based"]},
  {"name":"Association of Indian Students","tags":["Cultural & Identity-Based"]},
  {"name":"Association of Latino Professionals For America (ALPFA)","tags":["Cultural & Identity-Based","Career & Industry"]},
  {"name":"Bangladeshi Students' Association","tags":["Cultural & Identity-Based"]},
  {"name":"BAPS Campus Fellowship","tags":["Spiritual & Religious","Cultural & Identity-Based"]},
  {"name":"Caribbean Students Organization","tags":["Cultural & Identity-Based"]},
  {"name":"Chinese Students and Scholars Association (CSSA)","tags":["Cultural & Identity-Based"]},
  {"name":"Chinese Undergraduate Student Association","tags":["Cultural & Identity-Based"]},
  {"name":"Coptic Society","tags":["Spiritual & Religious","Cultural & Identity-Based"]},
  {"name":"Filipinos In Newark Engaging in Sociocultural Traditions","tags":["Cultural & Identity-Based"]},
  {"name":"Hispanic and Latinx Leadership Council","tags":["University Services","Cultural & Identity-Based"]},
  {"name":"Hispanic Association of Computing College Students","tags":["Cultural & Identity-Based","Academic & Scholastic","Career & Industry"]},
  {"name":"Hindu Youth for Unity, Virtues and Action","tags":["Spiritual & Religious","Cultural & Identity-Based"]},
  {"name":"Iranian Cultural Association","tags":["Cultural & Identity-Based"]},
  {"name":"Korean Student Association","tags":["Cultural & Identity-Based"]},
  {"name":"La Unidad Latina, Lambda Upsilon Lambda Fraternity Inc.","tags":["Greek Life","Cultural & Identity-Based"]},
  {"name":"Lambda Sigma Upsilon Latino Fraternity, Inc.","tags":["Greek Life","Cultural & Identity-Based"]},
  {"name":"Lambda Tau Omega Sorority Incorporated","tags":["Greek Life","Cultural & Identity-Based","Women-led"]},
  {"name":"Lambda Theta Phi Latin Fraternity, Inc.","tags":["Greek Life","Cultural & Identity-Based"]},
  {"name":"Lebanese Student Association","tags":["Cultural & Identity-Based"]},
  {"name":"Muslim Student Association","tags":["Spiritual & Religious","Cultural & Identity-Based"]},
  {"name":"National Organization of Minority Architecture Students","tags":["Cultural & Identity-Based","Academic & Scholastic"]},
  {"name":"Nepali Student Association","tags":["Cultural & Identity-Based"]},
  {"name":"Newark Sikh Student Association","tags":["Spiritual & Religious","Cultural & Identity-Based"]},
  {"name":"NJIT Hillel","tags":["Spiritual & Religious","Cultural & Identity-Based"]},
  {"name":"NJIT ISOTOPE","tags":["Cultural & Identity-Based","Career & Industry"]},
  {"name":"North African Society","tags":["Cultural & Identity-Based"]},
  {"name":"Pakistani Student Association","tags":["Cultural & Identity-Based"]},
  {"name":"Polish Student Association","tags":["Cultural & Identity-Based"]},
  {"name":"SANSKAR","tags":["Cultural & Identity-Based"]},
  {"name":"Society of Hispanic and Latine Appreciation","tags":["Cultural & Identity-Based"]},
  {"name":"Turkish Student Association","tags":["Cultural & Identity-Based"]},
  {"name":"Vietnamese Student Association","tags":["Cultural & Identity-Based"]},
  
  // Greek Life
  {"name":"Alpha Kappa Alpha Sorority","tags":["Greek Life","Cultural & Identity-Based","Service & Philanthropy"]},
  {"name":"Alpha Kappa Psi","tags":["Greek Life","Career & Industry"]},
  {"name":"Alpha Phi Alpha Fraternity Inc.","tags":["Greek Life","Service & Philanthropy"]},
  {"name":"Alpha Phi Delta","tags":["Greek Life"]},
  {"name":"Alpha Phi Omega","tags":["Greek Life","Service & Philanthropy"]},
  {"name":"Alpha Rho Chapter of Alpha Sigma Phi Fraternity","tags":["Greek Life"]},
  {"name":"Alpha Rho Chi","tags":["Greek Life","Career & Industry"]},
  {"name":"Alpha Sigma Tau","tags":["Greek Life","Women-led"]},
  {"name":"College Panhellenic Council","tags":["Greek Life","Student Governance & Councils"]},
  {"name":"Delta Epsilon Psi","tags":["Greek Life"]},
  {"name":"Delta Phi Epsilon Sorority","tags":["Greek Life","Women-led"]},
  {"name":"Delta Sigma Theta Sorority Inc. - Delta Zeta Chapter","tags":["Greek Life","Cultural & Identity-Based","Service & Philanthropy"]},
  {"name":"Fraternity and Sorority Life","tags":["Greek Life"]},
  {"name":"Greek Village","tags":["Greek Life","Residence Life"]},
  {"name":"Interfraternity Council","tags":["Greek Life","Student Governance & Councils"]},
  {"name":"Iota Phi Theta Fraternity Incorporated","tags":["Greek Life"]},
  {"name":"Kappa Sigma","tags":["Greek Life"]},
  {"name":"Multicultural Greek Council","tags":["Greek Life","Student Governance & Councils"]},
  {"name":"Order of Omega","tags":["Honor Societies","Greek Life"]},
  {"name":"Phi Beta Sigma Fraternity, Incorporated","tags":["Greek Life","Service & Philanthropy"]},
  {"name":"Phi Delta Theta","tags":["Greek Life"]},
  {"name":"Phi Sigma Kappa - Alpha Octaton","tags":["Greek Life"]},
  {"name":"Pi Kappa Phi","tags":["Greek Life"]},
  {"name":"Psi Upsilon","tags":["Greek Life"]},
  {"name":"Sigma Alpha Epsilon","tags":["Greek Life"]},
  {"name":"Sigma Pi Fraternity International","tags":["Greek Life"]},
  {"name":"Sigma Psi Kappa","tags":["Greek Life","Women-led"]},
  {"name":"Tau Delta Phi","tags":["Greek Life"]},
  {"name":"Tau Kappa Epsilon","tags":["Greek Life"]},
  {"name":"Theta Chi","tags":["Greek Life"]},
  {"name":"Zeta Phi Beta Sorority Inc.","tags":["Greek Life","Service & Philanthropy"]},
  
  // Health & Well-Being
  {"name":"Campus Health & Wellness","tags":["University Services","Health & Well-Being"]},
  {"name":"Center for Counseling and Psychological Services","tags":["University Services","Health & Well-Being"]},
  {"name":"Food Pantry","tags":["Health & Well-Being","Service & Philanthropy"]},
  {"name":"Health Occupations Students of America","tags":["Health & Well-Being","Career & Industry"]},
  {"name":"MedicZero","tags":["Health & Well-Being","Service & Philanthropy"]},
  {"name":"Minds+","tags":["Health & Well-Being"]},
  {"name":"NJIT First Aid Squad","tags":["Health & Well-Being","Service & Philanthropy"]},
  {"name":"NJIT Girl Gains","tags":["Health & Well-Being","Hobbies & Leisure","Women-led"]},
  {"name":"NJIT Remote Area Medical","tags":["Service & Philanthropy","Health & Well-Being"]},
  {"name":"North American Disease Intervention","tags":["Health & Well-Being","Service & Philanthropy"]},
  {"name":"Office of Prevention and Advocacy","tags":["University Services","Health & Well-Being","Civic Engagement & Advocacy"]},
  {"name":"Peer Wellness Coaching","tags":["Health & Well-Being"]},
  {"name":"Swim Club","tags":["Recreation & Sports","Health & Well-Being"]},
  {"name":"Weightlifting Club","tags":["Health & Well-Being","Recreation & Sports"]},
  
  // Honor Societies
  {"name":"Gamma Sigma Epsilon","tags":["Honor Societies"]},
  {"name":"National Residence Hall Honorary (NRHH)","tags":["Honor Societies","Residence Life"]},
  {"name":"Omega Chi Epsilon","tags":["Honor Societies","Engineering"]},
  {"name":"Phi Eta Sigma - National First Year Honor Society","tags":["Honor Societies"]},
  {"name":"Tau Beta Pi","tags":["Honor Societies","Engineering"]},
  
  // Hobbies & Leisure
  {"name":"Baking Club","tags":["Hobbies & Leisure"]},
  {"name":"Book Club","tags":["Hobbies & Leisure"]},
  {"name":"Dice and Decks","tags":["Hobbies & Leisure"]},
  {"name":"Highlander Chess Club","tags":["Recreation & Sports","Hobbies & Leisure"]},
  {"name":"Kids Who Code","tags":["Service & Philanthropy","Hobbies & Leisure"]},
  {"name":"Knit N' Crochet Club","tags":["Hobbies & Leisure","Service & Philanthropy"]},
  {"name":"NJIT Amateur Radio Club","tags":["Hobbies & Leisure"]},
  {"name":"Anime Club","tags":["Hobbies & Leisure"]},
  {"name":"Philosophy Club","tags":["Academic & Scholastic","Hobbies & Leisure"]},
  {"name":"The Munch Madness Club","tags":["Hobbies & Leisure"]},
  
  // Recreation & Sports
  {"name":"Archery Club","tags":["Recreation & Sports"]},
  {"name":"Athletics","tags":["University Services"]},
  {"name":"Aviation Club","tags":["Recreation & Sports"]},
  {"name":"Badminton Club","tags":["Recreation & Sports"]},
  {"name":"Cheerleaders","tags":["Recreation & Sports"]},
  {"name":"Esports","tags":["Recreation & Sports","Hobbies & Leisure"]},
  {"name":"Highlander League of Legends Club","tags":["Recreation & Sports","Hobbies & Leisure"]},
  {"name":"NJIT MMA Club","tags":["Recreation & Sports"]},
  {"name":"New Jersey Institute of Technology Soccer Club","tags":["Recreation & Sports"]},
  {"name":"NJIT Skate Club","tags":["Recreation & Sports","Hobbies & Leisure"]},
  {"name":"NJIT Tennis Club","tags":["Recreation & Sports"]},
  {"name":"NJIT Volleyball Club","tags":["Recreation & Sports"]},
  {"name":"Racquetball Club","tags":["Recreation & Sports"]},
  {"name":"Spikeball Club","tags":["Recreation & Sports"]},
  {"name":"Table Tennis Club","tags":["Recreation & Sports"]},
  {"name":"Ultimate Frisbee","tags":["Recreation & Sports"]},
  
  // Residence Life
  {"name":"Cypress Hall","tags":["Residence Life"]},
  {"name":"Cypress Hall Council","tags":["Residence Life","Student Governance & Councils"]},
  {"name":"Desk Operations","tags":["Residence Life"]},
  {"name":"Honors Hall","tags":["Residence Life"]},
  {"name":"Honors Hall Council","tags":["Residence Life","Student Governance & Councils"]},
  {"name":"John Martinson Honors Residence Hall","tags":["Residence Life"]},
  {"name":"Laurel Hall","tags":["Residence Life"]},
  {"name":"Laurel Hall Council","tags":["Residence Life","Student Governance & Councils"]},
  {"name":"Maple Hall","tags":["Residence Life"]},
  {"name":"Maple Hall Council","tags":["Residence Life","Student Governance & Councils"]},
  {"name":"Oak Hall","tags":["Residence Life"]},
  {"name":"Oak Hall Council","tags":["Residence Life","Student Governance & Councils"]},
  {"name":"Redwood Hall","tags":["Residence Life"]},
  {"name":"Redwood Hall Council","tags":["Residence Life","Student Governance & Councils"]},
  {"name":"Residence Hall Association","tags":["Residence Life","Student Governance & Councils"]},
  
  // Service & Philanthropy
  {"name":"Circle K International","tags":["Service & Philanthropy"]},
  {"name":"First Fellows","tags":["Civic Engagement & Advocacy"]},
  {"name":"Friends of Medecins sans Frontieres","tags":["Service & Philanthropy"]},
  {"name":"Habitat for Humanity","tags":["Service & Philanthropy"]},
  {"name":"Red Cross League","tags":["Service & Philanthropy"]},
  {"name":"Splash","tags":["Service & Philanthropy"]},
  {"name":"STEMentors Club","tags":["Career & Industry","Service & Philanthropy"]},
  {"name":"University Admissions Student Ambassadors","tags":["Service & Philanthropy","University Services"]},
  
  // Spiritual & Religious
  {"name":"Bible Study Club","tags":["Spiritual & Religious"]},
  {"name":"Chabad of Newark","tags":["Spiritual & Religious"]},
  {"name":"Christians on Campus","tags":["Spiritual & Religious"]},
  {"name":"Cru","tags":["Spiritual & Religious"]},
  {"name":"First Love NJIT","tags":["Spiritual & Religious"]},
  {"name":"InterVarsity Christian Fellowship","tags":["Spiritual & Religious"]},
  {"name":"Newman Catholic Campus Ministry","tags":["Spiritual & Religious"]},
  
  // Student Governance & Councils
  {"name":"First Year Students - for Student Senate","tags":["Student Governance & Councils"]},
  {"name":"Graduate Student Association","tags":["Student Governance & Councils"]},
  {"name":"Highlander Integrity Council","tags":["Student Governance & Councils"]},
  {"name":"Honors Student Council","tags":["Student Governance & Councils"]},
  {"name":"Off-Campus and Commuter Association","tags":["Student Governance & Councils"]},
  {"name":"Senior Class","tags":["Student Governance & Councils"]},
  {"name":"Student Activities Council","tags":["Student Governance & Councils"]},
  {"name":"Student Senate","tags":["Student Governance & Councils"]},
  
  // University Services
  {"name":"Career Development Services","tags":["University Services"]},
  {"name":"College of Science and Liberal Arts - Dean's Office","tags":["University Services"]},
  {"name":"Educational Opportunity Program","tags":["University Services"]},
  {"name":"GearUp/College Bound","tags":["University Services"]},
  {"name":"Learning Communities","tags":["Academic & Scholastic"]},
  {"name":"Makerspace","tags":["University Services","Career & Industry"]},
  {"name":"Murray Center for Women in Technology","tags":["University Services","Career & Industry","Women-led"]},
  {"name":"Newark College of Engineering","tags":["University Services"]},
  {"name":"NJIT ID Card Photo Submission","tags":["University Services"]},
  {"name":"Office for Student Involvement and Leadership","tags":["University Services"]},
  {"name":"Office of Academic Advising","tags":["University Services"]},
  {"name":"Office of Global Initiatives","tags":["University Services"]},
  {"name":"Office of Inclusive Excellence","tags":["University Services","Civic Engagement & Advocacy","Women-led"]},
  {"name":"Office of Public and Community Affairs","tags":["University Services","Civic Engagement & Advocacy"]},
  {"name":"Office of Student Transition","tags":["University Services"]},
  {"name":"Office of the Dean of Students","tags":["University Services"]},
  {"name":"OSL Student Employees","tags":["University Services"]},
  {"name":"Robert W. Van Houten Library","tags":["University Services"]},
  {"name":"Ronald E. McNair Postbaccalaureate Achievement Program","tags":["University Services","Academic & Scholastic"]},
  {"name":"Strategic Events & Conferencing Services","tags":["University Services"]},
  {"name":"The Lisa A. Pierce Center for Leadership","tags":["University Services","Career & Industry"]},
  {"name":"The Norma J. Clayton '81 Learning Center","tags":["University Services"]},
  {"name":"Transition, Engagement, Access, & Mentorship (T.E.A.M.)","tags":["University Services","Student Governance & Councils"]},
  
  // Career & Industry
  {"name":"Beta Psi Omega","tags":["Career & Industry","Academic & Scholastic"]},
  {"name":"Business Masterminds","tags":["Career & Industry"]},
  {"name":"Entrepreneur Society","tags":["Career & Industry"]},
  {"name":"The Salesforce Campus Group","tags":["Career & Industry"]},
  
  // Academic & Career mixed
  {"name":"The American Academy of Environmental Engineers & Scientists (AAEES)","tags":["Engineering","Career & Industry"]},
  
  // New categorizations for previously "Other / Needs Review" organizations
  {"name":"Coding Club","tags":["Academic & Scholastic","Career & Industry"]},
  {"name":"Game Development Club","tags":["Hobbies & Leisure","Academic & Scholastic"]},
  {"name":"Minecraft Club","tags":["Hobbies & Leisure","Recreation & Sports"]},
  {"name":"Highlander Media","tags":["Arts, Music & Media"]},
  {"name":"Podcast Club","tags":["Arts, Music & Media","Hobbies & Leisure"]}
];

// All unique categories from the data
const allCategories = [
  "Academic & Scholastic",
  "Arts, Music & Media",
  "Career & Industry",
  "Civic Engagement & Advocacy",
  "Cultural & Identity-Based",
  "Engineering",
  "Greek Life",
  "Health & Well-Being",
  "Hobbies & Leisure",
  "Honor Societies",
  "Recreation & Sports",
  "Residence Life",
  "Service & Philanthropy",
  "Spiritual & Religious",
  "Student Governance & Councils",
  "University Services",
  "Women-led",
  "Other / Needs Review"
];

export async function GET() {
  // Add debugging logging to track category filtering issues
  console.log("--- Debugging: organizationCategories API called");
  console.log("--- Debugging: Total organization mappings:", organizationCategories.length);
  
  // Log organizations still tagged as "Other / Needs Review"
  const orgsWithOtherTag = organizationCategories.filter(org => 
    org.tags.includes("Other / Needs Review")
  );
  console.log("--- Debugging: Organizations still tagged as 'Other / Needs Review':", 
    orgsWithOtherTag.map(org => org.name)
  );
  
  return NextResponse.json({
    categories: allCategories,
    organizationCategories: organizationCategories,
    categoryDescriptions: categoryDescriptions
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
} 