export type TaskType = 'speed' | 'problem_breakdown' | 'puzzle' | 'reading' | 'flashcard';
export type InputType = 'mcq' | 'single_tap' | 'ordering' | 'highlight' | 'short_text' | 'flashcard';

export interface MicroTask {
  id: string;
  subject: string;
  topic: string;
  unit: string;
  task_type: TaskType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  estimated_time_seconds: number;
  input_type: InputType;
  answer_options?: string[];
  correct_answer: number | string;
  hints: string[];
  explanation: string;
  language: string;
  metadata: {
    grade: 11 | 12;
    tags: string[];
    learning_objective: string;
  };
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  tasks: MicroTask[];
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  units: Unit[];
}

export interface Grade {
  grade: 11 | 12;
  subjects: Subject[];
}

export const curriculum: Grade[] = [
  {
    grade: 11,
    subjects: [
      {
        id: 'physics-11',
        name: 'Physics',
        icon: 'Atom',
        color: 'from-blue-400 to-cyan-400',
        units: [
          {
            id: 'units-measurement',
            name: 'Physical World & Units',
            description: 'SI Units, measurement, errors, and significant figures',
            topics: [
              {
                id: 'si-units',
                name: 'SI Units & Conversions',
                description: 'Understanding the International System of Units',
                tasks: [
                  {
                    id: 'm-phy11-units-01',
                    subject: 'Physics',
                    topic: 'SI Units',
                    unit: 'Physical World & Units',
                    task_type: 'speed',
                    difficulty: 1,
                    prompt: 'Which is the SI unit of force?',
                    estimated_time_seconds: 180,
                    input_type: 'mcq',
                    answer_options: ['Dyne', 'Newton', 'Pound', 'Kilogram'],
                    correct_answer: 1,
                    hints: ['Force = mass × acceleration', 'Named after a famous scientist'],
                    explanation: 'The SI unit of force is Newton (N). It is derived from kg⋅m/s². One Newton is the force required to accelerate 1 kg mass at 1 m/s².',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['units', 'SI', 'force'],
                      learning_objective: 'Identify and recall fundamental SI units'
                    }
                  },
                  {
                    id: 'm-phy11-units-02',
                    subject: 'Physics',
                    topic: 'Unit Conversions',
                    unit: 'Physical World & Units',
                    task_type: 'problem_breakdown',
                    difficulty: 2,
                    prompt: 'Convert 5 km/h to m/s',
                    estimated_time_seconds: 360,
                    input_type: 'short_text',
                    correct_answer: '1.39',
                    hints: ['1 km = 1000 m', '1 hour = 3600 seconds'],
                    explanation: 'To convert km/h to m/s: multiply by 1000 (km→m) and divide by 3600 (h→s). So 5 × 1000/3600 = 1.39 m/s.',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['conversion', 'velocity', 'units'],
                      learning_objective: 'Apply conversion factors between unit systems'
                    }
                  }
                ]
              },
              {
                id: 'significant-figures',
                name: 'Significant Figures',
                description: 'Rules for counting and calculating with significant digits',
                tasks: [
                  {
                    id: 'm-phy11-sigfig-01',
                    subject: 'Physics',
                    topic: 'Significant Figures',
                    unit: 'Physical World & Units',
                    task_type: 'speed',
                    difficulty: 2,
                    prompt: 'How many significant figures in 0.00450?',
                    estimated_time_seconds: 240,
                    input_type: 'mcq',
                    answer_options: ['2', '3', '4', '5'],
                    correct_answer: 1,
                    hints: ['Leading zeros don\'t count', 'Trailing zeros after decimal count'],
                    explanation: 'The number 0.00450 has 3 significant figures: 4, 5, and 0. Leading zeros are not significant, but the trailing zero after the decimal is.',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['significant-figures', 'precision', 'measurement'],
                      learning_objective: 'Count significant figures correctly'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'motion-straight-line',
            name: 'Motion in a Straight Line',
            description: 'Kinematics: displacement, velocity, acceleration',
            topics: [
              {
                id: 'displacement-velocity',
                name: 'Displacement & Velocity',
                description: 'Understanding vector quantities of motion',
                tasks: [
                  {
                    id: 'm-phy11-motion-01',
                    subject: 'Physics',
                    topic: 'Displacement vs Distance',
                    unit: 'Motion in a Straight Line',
                    task_type: 'puzzle',
                    difficulty: 2,
                    prompt: 'Match each motion type with its graph shape',
                    estimated_time_seconds: 300,
                    input_type: 'ordering',
                    answer_options: ['Uniform motion', 'Accelerated motion', 'Stationary object', 'Decelerated motion'],
                    correct_answer: 'uniform-straight,accelerated-curve-up,stationary-horizontal,decelerated-curve-down',
                    hints: ['Uniform motion has constant slope', 'Acceleration curves upward'],
                    explanation: 'Uniform motion shows a straight diagonal line (constant velocity), accelerated motion curves upward (increasing velocity), stationary is horizontal (zero velocity), and decelerated motion curves downward.',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['velocity', 'graphs', 'motion'],
                      learning_objective: 'Interpret velocity-time graphs'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'chemistry-11',
        name: 'Chemistry',
        icon: 'FlaskConical',
        color: 'from-purple-400 to-pink-400',
        units: [
          {
            id: 'basic-concepts',
            name: 'Some Basic Concepts',
            description: 'Mole concept, stoichiometry, atomic mass',
            topics: [
              {
                id: 'mole-concept',
                name: 'Mole Concept',
                description: 'Understanding Avogadro\'s number and molar calculations',
                tasks: [
                  {
                    id: 'm-chem11-mole-01',
                    subject: 'Chemistry',
                    topic: 'Mole Concept',
                    unit: 'Basic Concepts',
                    task_type: 'problem_breakdown',
                    difficulty: 2,
                    prompt: 'How many molecules in 2 moles of H₂O?',
                    estimated_time_seconds: 420,
                    input_type: 'short_text',
                    correct_answer: '1.204×10²⁴',
                    hints: ['Use Avogadro\'s number: 6.022×10²³', 'Multiply moles by Avogadro\'s number'],
                    explanation: 'Number of molecules = moles × Avogadro\'s number = 2 × 6.022×10²³ = 1.204×10²⁴ molecules.',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['mole', 'avogadro', 'molecules'],
                      learning_objective: 'Calculate number of particles from moles'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'math-11',
        name: 'Mathematics',
        icon: 'Calculator',
        color: 'from-green-400 to-emerald-400',
        units: [
          {
            id: 'sets-relations',
            name: 'Sets & Relations',
            description: 'Set theory, Venn diagrams, relations and functions',
            topics: [
              {
                id: 'set-operations',
                name: 'Set Operations',
                description: 'Union, intersection, and complement of sets',
                tasks: [
                  {
                    id: 'm-math11-sets-01',
                    subject: 'Mathematics',
                    topic: 'Set Operations',
                    unit: 'Sets & Relations',
                    task_type: 'puzzle',
                    difficulty: 2,
                    prompt: 'If A={1,2,3} and B={2,3,4}, what is A∪B?',
                    estimated_time_seconds: 300,
                    input_type: 'mcq',
                    answer_options: ['{2,3}', '{1,2,3,4}', '{1,4}', '{1,2,3,2,3,4}'],
                    correct_answer: 1,
                    hints: ['Union means all elements from both sets', 'Don\'t repeat elements'],
                    explanation: 'A∪B (union) contains all elements from both sets without repetition: {1,2,3,4}.',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['sets', 'union', 'operations'],
                      learning_objective: 'Perform set union operations'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'biology-11',
        name: 'Biology',
        icon: 'Leaf',
        color: 'from-lime-400 to-green-500',
        units: [
          {
            id: 'cell-structure',
            name: 'Cell: Structure & Function',
            description: 'Cell organelles, their structure and functions',
            topics: [
              {
                id: 'organelles',
                name: 'Cell Organelles',
                description: 'Mitochondria, chloroplasts, nucleus, and more',
                tasks: [
                  {
                    id: 'm-bio11-cell-01',
                    subject: 'Biology',
                    topic: 'Cell Organelles',
                    unit: 'Cell Structure',
                    task_type: 'flashcard',
                    difficulty: 1,
                    prompt: 'What is the powerhouse of the cell?',
                    estimated_time_seconds: 180,
                    input_type: 'flashcard',
                    correct_answer: 'Mitochondria',
                    hints: ['It produces ATP', 'Involved in cellular respiration'],
                    explanation: 'Mitochondria are called the powerhouse of the cell because they generate most of the cell\'s ATP through cellular respiration.',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['cell', 'mitochondria', 'organelles'],
                      learning_objective: 'Identify key cell organelles and functions'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'english-11',
        name: 'English',
        icon: 'BookOpen',
        color: 'from-orange-400 to-red-400',
        units: [
          {
            id: 'reading-comprehension',
            name: 'Reading Comprehension',
            description: 'Unseen passages, main idea extraction, inference',
            topics: [
              {
                id: 'main-idea',
                name: 'Main Idea Extraction',
                description: 'Identify central themes and key points',
                tasks: [
                  {
                    id: 'm-eng11-read-01',
                    subject: 'English',
                    topic: 'Main Idea',
                    unit: 'Reading Comprehension',
                    task_type: 'reading',
                    difficulty: 2,
                    prompt: 'Read the passage and identify the main theme',
                    estimated_time_seconds: 360,
                    input_type: 'highlight',
                    correct_answer: 'Environmental conservation requires collective action',
                    hints: ['Look for repeated concepts', 'What is the author emphasizing?'],
                    explanation: 'The passage emphasizes that environmental conservation cannot be achieved by individuals alone but requires collective societal action and policy changes.',
                    language: 'en',
                    metadata: {
                      grade: 11,
                      tags: ['reading', 'comprehension', 'main-idea'],
                      learning_objective: 'Extract central theme from passages'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    grade: 12,
    subjects: [
      {
        id: 'physics-12',
        name: 'Physics',
        icon: 'Atom',
        color: 'from-blue-500 to-cyan-500',
        units: [
          {
            id: 'electrostatics',
            name: 'Electric Charges & Fields',
            description: 'Coulomb\'s law, electric field, Gauss\'s law',
            topics: [
              {
                id: 'coulombs-law',
                name: 'Coulomb\'s Law',
                description: 'Force between charged particles',
                tasks: [
                  {
                    id: 'm-phy12-elec-01',
                    subject: 'Physics',
                    topic: 'Coulomb\'s Law',
                    unit: 'Electrostatics',
                    task_type: 'speed',
                    difficulty: 2,
                    prompt: 'Two charges repel each other. What can you conclude?',
                    estimated_time_seconds: 240,
                    input_type: 'mcq',
                    answer_options: ['Both positive or both negative', 'One positive, one negative', 'Both neutral', 'Cannot determine'],
                    correct_answer: 0,
                    hints: ['Like charges repel', 'Opposite charges attract'],
                    explanation: 'When two charges repel, they must be like charges (both positive or both negative). Opposite charges attract each other.',
                    language: 'en',
                    metadata: {
                      grade: 12,
                      tags: ['electrostatics', 'coulomb', 'charges'],
                      learning_objective: 'Apply Coulomb\'s law principles'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'chemistry-12',
        name: 'Chemistry',
        icon: 'FlaskConical',
        color: 'from-purple-500 to-pink-500',
        units: [
          {
            id: 'solid-state',
            name: 'Solid State',
            description: 'Crystal lattices, unit cells, packing efficiency',
            topics: [
              {
                id: 'unit-cells',
                name: 'Unit Cells',
                description: 'Types of unit cells and their properties',
                tasks: [
                  {
                    id: 'm-chem12-solid-01',
                    subject: 'Chemistry',
                    topic: 'Unit Cells',
                    unit: 'Solid State',
                    task_type: 'puzzle',
                    difficulty: 3,
                    prompt: 'Match crystal systems with their axial parameters',
                    estimated_time_seconds: 300,
                    input_type: 'ordering',
                    correct_answer: 'cubic-a=b=c,tetragonal-a=b≠c,orthorhombic-a≠b≠c',
                    hints: ['Cubic has all equal sides', 'Tetragonal has two equal'],
                    explanation: 'Cubic: a=b=c, α=β=γ=90°. Tetragonal: a=b≠c, α=β=γ=90°. Orthorhombic: a≠b≠c, α=β=γ=90°.',
                    language: 'en',
                    metadata: {
                      grade: 12,
                      tags: ['solid-state', 'crystal', 'unit-cell'],
                      learning_objective: 'Classify crystal systems by parameters'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'math-12',
        name: 'Mathematics',
        icon: 'Calculator',
        color: 'from-green-500 to-emerald-500',
        units: [
          {
            id: 'relations-functions',
            name: 'Relations & Functions',
            description: 'Types of functions, inverse functions, composition',
            topics: [
              {
                id: 'inverse-functions',
                name: 'Inverse Functions',
                description: 'Finding and verifying inverse functions',
                tasks: [
                  {
                    id: 'm-math12-func-01',
                    subject: 'Mathematics',
                    topic: 'Inverse Functions',
                    unit: 'Relations & Functions',
                    task_type: 'speed',
                    difficulty: 2,
                    prompt: 'If f(x)=2x+3, what is f⁻¹(x)?',
                    estimated_time_seconds: 240,
                    input_type: 'mcq',
                    answer_options: ['(x-3)/2', '(x+3)/2', '2x-3', 'x/2+3'],
                    correct_answer: 0,
                    hints: ['Replace f(x) with y, solve for x', 'Swap x and y'],
                    explanation: 'To find inverse: y=2x+3 → x=(y-3)/2 → f⁻¹(x)=(x-3)/2',
                    language: 'en',
                    metadata: {
                      grade: 12,
                      tags: ['functions', 'inverse', 'algebra'],
                      learning_objective: 'Calculate inverse functions algebraically'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'calculus',
            name: 'Calculus',
            description: 'Integration, differentiation, applications',
            topics: [
              {
                id: 'integration',
                name: 'Integration Techniques',
                description: 'Methods of integration and their applications',
                tasks: [
                  {
                    id: 'm-math12-calc-01',
                    subject: 'Mathematics',
                    topic: 'Basic Integration',
                    unit: 'Calculus',
                    task_type: 'problem_breakdown',
                    difficulty: 3,
                    prompt: '∫x² dx = ?',
                    estimated_time_seconds: 480,
                    input_type: 'short_text',
                    correct_answer: 'x³/3 + C',
                    hints: ['Use power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1)', 'Don\'t forget constant of integration'],
                    explanation: 'Using power rule: ∫x² dx = x²⁺¹/(2+1) + C = x³/3 + C. Always add constant C for indefinite integrals.',
                    language: 'en',
                    metadata: {
                      grade: 12,
                      tags: ['integration', 'calculus', 'power-rule'],
                      learning_objective: 'Apply power rule for integration'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'biology-12',
        name: 'Biology',
        icon: 'Leaf',
        color: 'from-lime-500 to-green-600',
        units: [
          {
            id: 'reproduction',
            name: 'Reproduction',
            description: 'Sexual reproduction in plants and animals',
            topics: [
              {
                id: 'human-reproduction',
                name: 'Human Reproduction',
                description: 'Reproductive systems and processes',
                tasks: [
                  {
                    id: 'm-bio12-repro-01',
                    subject: 'Biology',
                    topic: 'Gametogenesis',
                    unit: 'Reproduction',
                    task_type: 'problem_breakdown',
                    difficulty: 3,
                    prompt: 'Arrange the steps of spermatogenesis in order',
                    estimated_time_seconds: 420,
                    input_type: 'ordering',
                    correct_answer: 'spermatogonia-primary-spermatocyte-secondary-spermatocyte-spermatid-sperm',
                    hints: ['Starts with diploid cells', 'Meiosis produces haploid cells'],
                    explanation: 'Spermatogenesis: Spermatogonia (2n) → Primary spermatocyte (2n) → Meiosis I → Secondary spermatocyte (n) → Meiosis II → Spermatid (n) → Differentiation → Sperm (n)',
                    language: 'en',
                    metadata: {
                      grade: 12,
                      tags: ['reproduction', 'spermatogenesis', 'meiosis'],
                      learning_objective: 'Sequence stages of gametogenesis'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'genetics',
            name: 'Genetics & Evolution',
            description: 'Mendel\'s laws, inheritance patterns, DNA',
            topics: [
              {
                id: 'mendelian-genetics',
                name: 'Mendelian Genetics',
                description: 'Laws of inheritance and genetic crosses',
                tasks: [
                  {
                    id: 'm-bio12-gen-01',
                    subject: 'Biology',
                    topic: 'Monohybrid Cross',
                    unit: 'Genetics',
                    task_type: 'puzzle',
                    difficulty: 2,
                    prompt: 'What is the phenotypic ratio in F2 of monohybrid cross?',
                    estimated_time_seconds: 300,
                    input_type: 'mcq',
                    answer_options: ['1:1', '3:1', '9:3:3:1', '1:2:1'],
                    correct_answer: 1,
                    hints: ['F1 all heterozygous', 'Dominant masks recessive'],
                    explanation: 'In F2 generation of monohybrid cross, phenotypic ratio is 3:1 (3 dominant : 1 recessive). Genotypic ratio is 1:2:1.',
                    language: 'en',
                    metadata: {
                      grade: 12,
                      tags: ['genetics', 'mendel', 'monohybrid'],
                      learning_objective: 'Predict ratios from genetic crosses'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'english-12',
        name: 'English',
        icon: 'BookOpen',
        color: 'from-orange-500 to-red-500',
        units: [
          {
            id: 'advanced-reading',
            name: 'Advanced Reading',
            description: 'Critical analysis, inference, literary devices',
            topics: [
              {
                id: 'inference',
                name: 'Making Inferences',
                description: 'Draw conclusions from textual evidence',
                tasks: [
                  {
                    id: 'm-eng12-read-01',
                    subject: 'English',
                    topic: 'Inference',
                    unit: 'Advanced Reading',
                    task_type: 'reading',
                    difficulty: 3,
                    prompt: 'What can be inferred about the author\'s perspective?',
                    estimated_time_seconds: 360,
                    input_type: 'mcq',
                    answer_options: [
                      'Optimistic about technology',
                      'Cautious about rapid change',
                      'Opposed to innovation',
                      'Neutral observer'
                    ],
                    correct_answer: 1,
                    hints: ['Look for tone and word choice', 'What warnings does the author give?'],
                    explanation: 'The author\'s use of words like "however," "caution," and "unintended consequences" suggests a cautious stance toward rapid technological change, not opposition but careful consideration.',
                    language: 'en',
                    metadata: {
                      grade: 12,
                      tags: ['inference', 'critical-reading', 'analysis'],
                      learning_objective: 'Make evidence-based inferences'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper functions
export const getSubjectByGradeAndId = (grade: 11 | 12, subjectId: string): Subject | undefined => {
  const gradeData = curriculum.find(g => g.grade === grade);
  return gradeData?.subjects.find(s => s.id === subjectId);
};

export const getAllTasksBySubject = (grade: 11 | 12, subjectId: string): MicroTask[] => {
  const subject = getSubjectByGradeAndId(grade, subjectId);
  if (!subject) return [];
  
  const tasks: MicroTask[] = [];
  subject.units.forEach(unit => {
    unit.topics.forEach(topic => {
      tasks.push(...topic.tasks);
    });
  });
  return tasks;
};

export const getTaskById = (taskId: string): MicroTask | undefined => {
  for (const grade of curriculum) {
    for (const subject of grade.subjects) {
      for (const unit of subject.units) {
        for (const topic of unit.topics) {
          const task = topic.tasks.find(t => t.id === taskId);
          if (task) return task;
        }
      }
    }
  }
  return undefined;
};
