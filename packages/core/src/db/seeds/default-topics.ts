import { topicService, cardService } from '../database';

export async function seedDefaultTopics(): Promise<void> {
  // Mathematics root topic
  const math = await topicService.create({
    name: 'Mathematics',
    color: '#C75D38',
  });

  // Linear Algebra
  const linearAlgebra = await topicService.create({
    name: 'Linear Algebra',
    parentId: math.id,
    color: '#2D7D5A',
  });

  await topicService.create({
    name: 'Vectors',
    parentId: linearAlgebra.id,
    color: '#2D7D5A',
  });

  await topicService.create({
    name: 'Matrices',
    parentId: linearAlgebra.id,
    color: '#2D7D5A',
  });

  const determinants = await topicService.create({
    name: 'Determinants',
    parentId: linearAlgebra.id,
    color: '#2D7D5A',
  });

  await topicService.create({
    name: 'Eigenvalues',
    parentId: linearAlgebra.id,
    color: '#2D7D5A',
  });

  // Calculus
  const calculus = await topicService.create({
    name: 'Calculus',
    parentId: math.id,
    color: '#B8860B',
  });

  const differentiation = await topicService.create({
    name: 'Differentiation',
    parentId: calculus.id,
    color: '#B8860B',
  });

  const integration = await topicService.create({
    name: 'Integration',
    parentId: calculus.id,
    color: '#B8860B',
  });

  await topicService.create({
    name: 'Limits',
    parentId: calculus.id,
    color: '#B8860B',
  });

  // Physics root topic
  const physics = await topicService.create({
    name: 'Physics',
    color: '#6366F1',
  });

  await topicService.create({
    name: 'Mechanics',
    parentId: physics.id,
    color: '#6366F1',
  });

  await topicService.create({
    name: 'Electromagnetism',
    parentId: physics.id,
    color: '#6366F1',
  });

  // Set related topics for interleaving
  await topicService.update({
    id: determinants.id,
    relatedTopicIds: [linearAlgebra.id],
  });

  await topicService.update({
    id: differentiation.id,
    relatedTopicIds: [integration.id],
  });

  await topicService.update({
    id: integration.id,
    relatedTopicIds: [differentiation.id],
  });
}

export async function seedSampleCards(): Promise<void> {
  const topics = await topicService.getAll();
  const findTopic = (name: string) => topics.find((t) => t.name === name);

  const calculus = findTopic('Calculus');
  const differentiation = findTopic('Differentiation');
  const integration = findTopic('Integration');
  const linearAlgebra = findTopic('Linear Algebra');
  const determinants = findTopic('Determinants');
  const matrices = findTopic('Matrices');

  if (!calculus || !differentiation || !integration) return;
  if (!linearAlgebra || !determinants || !matrices) return;

  // Calculus cards
  await cardService.create({
    type: 'basic',
    front: 'What is the derivative of $\\sin(x)$?',
    back: '$\\cos(x)$',
    topicIds: [calculus.id, differentiation.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the derivative of $\\cos(x)$?',
    back: '$-\\sin(x)$',
    topicIds: [calculus.id, differentiation.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the derivative of $e^x$?',
    back: '$e^x$',
    topicIds: [calculus.id, differentiation.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the derivative of $\\ln(x)$?',
    back: '$\\frac{1}{x}$',
    topicIds: [calculus.id, differentiation.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is $\\int \\sin(x) \\, dx$?',
    back: '$-\\cos(x) + C$',
    topicIds: [calculus.id, integration.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is $\\int \\cos(x) \\, dx$?',
    back: '$\\sin(x) + C$',
    topicIds: [calculus.id, integration.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is $\\int e^x \\, dx$?',
    back: '$e^x + C$',
    topicIds: [calculus.id, integration.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is $\\int \\frac{1}{x} \\, dx$?',
    back: '$\\ln|x| + C$',
    topicIds: [calculus.id, integration.id],
  });

  // Linear Algebra cards
  await cardService.create({
    type: 'basic',
    front:
      'What is the determinant of a 2×2 matrix $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$?',
    back: '$ad - bc$',
    topicIds: [linearAlgebra.id, determinants.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the identity matrix $I_2$?',
    back: '$\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$',
    topicIds: [linearAlgebra.id, matrices.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'For a matrix $A$, what does $A \\cdot I = ?$',
    back: '$A$ (identity property)',
    topicIds: [linearAlgebra.id, matrices.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the transpose of matrix $A$, denoted $A^T$?',
    back: 'The matrix obtained by interchanging rows and columns: $(A^T)_{ij} = A_{ji}$',
    topicIds: [linearAlgebra.id, matrices.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'When is a square matrix invertible?',
    back: 'When its determinant is non-zero: $\\det(A) \\neq 0$',
    topicIds: [linearAlgebra.id, determinants.id, matrices.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the product rule for derivatives?',
    back: '$(fg)\' = f\'g + fg\'$',
    topicIds: [calculus.id, differentiation.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the chain rule for derivatives?',
    back: '$(f \\circ g)\'(x) = f\'(g(x)) \\cdot g\'(x)$',
    topicIds: [calculus.id, differentiation.id],
  });

  await cardService.create({
    type: 'basic',
    front: 'What is the quotient rule for derivatives?',
    back: '$\\left(\\frac{f}{g}\\right)\' = \\frac{f\'g - fg\'}{g^2}$',
    topicIds: [calculus.id, differentiation.id],
  });
}
