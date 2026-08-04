import { PrismaClient, ComplianceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ndpa = await prisma.complianceFramework.upsert({
    where: { id: 'framework-ndpa-nigeria' },
    update: {},
    create: {
      id: 'framework-ndpa-nigeria',
      name: 'Nigeria Data Protection Act (NDPA)',
      version: '2023',
      jurisdiction: 'Nigeria',
      description: 'The primary legislation governing data protection and privacy in Nigeria.',
      requirements: {
        create: [
          {
            code: 'NDPA-01',
            title: 'Data Processing Principles',
            description: 'Ensure data is processed lawfully, fairly, and transparently.',
          },
          {
            code: 'NDPA-02',
            title: 'Data Subject Rights',
            description: 'Provide mechanisms for data subjects to exercise their rights (access, rectification, erasure).',
          },
          {
            code: 'NDPA-03',
            title: 'Security Measures',
            description: 'Implement appropriate technical and organizational measures to ensure data security.',
          },
        ],
      },
    },
  });

  const popia = await prisma.complianceFramework.upsert({
    where: { id: 'framework-popia-sa' },
    update: {},
    create: {
      id: 'framework-popia-sa',
      name: 'Protection of Personal Information Act (POPIA)',
      version: '2013',
      jurisdiction: 'South Africa',
      description: 'South Africa\'s data protection law aimed at protecting personal information processed by public and private bodies.',
      requirements: {
        create: [
          {
            code: 'POPIA-01',
            title: 'Accountability',
            description: 'The responsible party must ensure that the conditions for lawful processing are complied with.',
          },
          {
            code: 'POPIA-02',
            title: 'Processing Limitation',
            description: 'Personal information must be processed lawfully and in a reasonable manner.',
          },
        ],
      },
    },
  });

  const zdpa = await prisma.complianceFramework.upsert({
    where: { id: 'framework-zdpa-zambia' },
    update: {},
    create: {
      id: 'framework-zdpa-zambia',
      name: 'Zambia Data Protection Act',
      version: '2021 (Act No. 3 of 2021)',
      jurisdiction: 'Zambia',
      description: 'Zambia\'s legislation governing the collection, processing, and protection of personal data by public and private bodies.',
      requirements: {
        create: [
          {
            code: 'ZDPA-01',
            title: 'Lawful Processing',
            description: 'Personal data must be processed lawfully, with a valid basis such as consent, contract, or legal obligation.',
          },
          {
            code: 'ZDPA-02',
            title: 'Data Subject Rights',
            description: 'Data subjects must be able to access, correct, and request erasure of their personal data held by the responsible party.',
          },
          {
            code: 'ZDPA-03',
            title: 'Security Safeguards',
            description: 'Appropriate technical and organizational measures must be implemented to protect personal data against unauthorized access, loss, or disclosure.',
          },
          {
            code: 'ZDPA-04',
            title: 'Cross-Border Transfer Restrictions',
            description: 'Personal data may only be transferred outside Zambia where the receiving jurisdiction ensures an adequate level of protection.',
          },
        ],
      },
    },
  });

  console.log('Compliance frameworks seeded:', { ndpa: ndpa.name, popia: popia.name, zdpa: zdpa.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
