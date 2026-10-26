const schoolData = {
  quickLinks: [
    { label: 'School Profile', href: '#about', description: 'Learn about our purpose and community.' },
    { label: 'Academics', href: '#academics', description: 'Classes, medium, and education structure.' },
    { label: 'Facilities', href: '#facilities', description: 'Core resources and learning support.' },
    { label: 'Notices', href: '#notices', description: 'Announcements, events, and updates.' }
  ],

  infoTable: [
    { label: 'English name', value: 'Mashra High School' },
    { label: 'Bengali name', value: 'মাশরা উচ্চ বিদ্যালয়' },
    { label: 'UDISE code', value: '19081206902' },
    { label: 'Established', value: '1970' },
    { label: 'Location', value: 'Mashra, Rampurhat-I, Birbhum, West Bengal, India' },
    { label: 'PIN code', value: '731216' },
    { label: 'Management (directory-reported)', value: 'Government-managed' },
    { label: 'Institution type', value: 'Co-educational' },
    { label: 'Headmaster (directory-listed)', value: 'Debjit Sarkar' },
    { label: 'Verification note', value: 'Some details require local administrative confirmation.' }
  ],

  academics: {
    classesOffered: 'Classes 5–12',
    mediumOfInstruction: 'Bengali',
    boardAffiliation: 'WBBSE and WBCHSE',
    subjects: [
      'Primary school learning foundation',
      'Language and literacy development',
      'Mathematics and science learning',
      'Social studies and environmental awareness',
      'Arts, value education, and co-curricular development'
    ],
    examInfo: 'Formal examination structure should be confirmed from the school administration for the current academic year.'
  },

  facilities: [
    { name: 'Library', status: 'Unavailable', note: 'The library is currently unavailable.' },
    { name: 'Computer laboratory', status: 'Closed', note: 'The computer laboratory is currently closed.' },
    { name: 'Internet access', status: 'Available', note: 'Provided by the school.' },
    { name: 'Electricity', status: 'Available', note: 'Provided by the school.' },
    { name: 'Drinking water', status: 'Available', note: 'Provided by the school.' },
    { name: 'Separate toilets', status: 'Available', note: 'Provided by the school.' },
    { name: 'Mid-day meal facility', status: 'Available', note: 'Provided by the school.' }
  ],

  notices: [],

  gallery: [
    {
      title: 'Main school entrance',
      alt: 'Front view of Mashra High School entrance',
      src: './main.00.png'
    },
    {
      title: 'School campus courtyard',
      alt: 'Courtyard and surrounding buildings at Mashra High School',
      src: './interior.webp'
    },
    {
      title: 'School building exterior',
      alt: 'Exterior facade of Mashra High School',
      src: './exterior.webp'
    }
  ]
};

window.schoolData = schoolData;
