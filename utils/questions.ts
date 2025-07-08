// utils/questions.js

export const personalQuestions = [
    { id: 'name', question: 'Name', type: 'text' },
    { id: 'age', question: 'Age', type: 'number' },
    { id: 'gender', question: 'Gender', type: 'picker', options: ['Male', 'Female', 'Other'] },
    { id: 'occupation', question: 'Occupation', type: 'picker', options: ['Student', 'Working Professional'] },
    { id: 'income', question: 'Income', type: 'picker', options: ['<100000', '100000 < income < 10,00,000', '>10,00,000'], occupationDependent: true },
    { id: 'education', question: 'Education', type: 'picker', options: ['10', '12', 'UG', 'PG'] },
    { id: 'hobbies', question: 'Hobbies', type: 'text' }
  ];
  
  export const mentalHealthQuestions = [
    'I drink alcohol often',
    'I smoke often',
    'I do drugs often',
    'I feel lack of confidence generally.',
    'I feel depressed/dejected most of the time.',
    'I am anxious about my future.',
    'I feel that my relations with others are not satisfactory.',
    'I am not able to concentrate fully in my works.',
    'I use to worry even about trivial matters for a long time.',
    'I feel to be insecure.',
    'My mood changes momentarily.',
    'I am not able to continue any task for long.',
    'I hesitate in meeting with others.',
    'I am not able to take quick decisions on any subject.',
    'I suffer from inferiority complex.'
  ];
  
  export const mentalHealthOptions = [
    'Always',
    'Most of the time',
    'Neutral',
    'Sometimes',
    'Never'
  ];
  