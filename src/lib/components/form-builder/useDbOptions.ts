import { useState, useEffect } from 'react';

export const useDbOptions = () => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/specialities')
      .then((r) => r.json())
      .then((data) => setSpecialties(data.map((s: { code: string; name: string }) => `${s.code} ${s.name}`)))
      .catch(() => {});

    fetch('http://localhost:3000/benefits')
      .then((r) => r.json())
      .then((data) => setBenefits(data.map((b: { name: string }) => b.name)))
      .catch(() => {});

    fetch('http://localhost:3000/documents')
      .then((r) => r.json())
      .then((data) => setDocuments(data.map((d: { name: string }) => d.name)))
      .catch(() => {});
  }, []);

  return { specialties, benefits, documents };
};
