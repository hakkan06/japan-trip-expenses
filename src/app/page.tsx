'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

type User = { id: string; name: string };
type Category = { id: string; name: string; color: string; icon: string };
type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  paidBy: User;
  category: Category;
  participants: User[];
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidById, setPaidById] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, cRes, eRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/categories'),
        fetch('/api/expenses')
      ]);
      const uData = await uRes.json();
      const cData = await cRes.json();
      const eData = await eRes.json();

      setUsers(uData);
      setCategories(cData);
      setExpenses(eData);
      
      if (uData.length > 0) {
        setPaidById(uData[0].id);
        setParticipantIds(uData.map((u: User) => u.id));
      }
      if (cData.length > 0) setCategoryId(cData[0].id);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !categoryId || participantIds.length === 0) return;
    setIsSubmitting(true);
    
    // Default to the first user since we don't care about "Kim Ödedi" anymore
    const actualPaidById = paidById || (users.length > 0 ? users[0].id : '');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount,
          date,
          paidById: actualPaidById,
          categoryId,
          participantIds
        })
      });

      if (res.ok) {
        setTitle('');
        setAmount('');
        fetchData(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Bu harcamayı silmek istediğinize emin misiniz?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleParticipant = (id: string) => {
    setParticipantIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Toplam Hesaplaması
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) return <div className="container"><p>Yükleniyor...</p></div>;

  return (
    <main className="container">
      <h1 className="title">🎌 Japan Trip Expenses</h1>
      
      <div className={styles.grid}>
        {/* Left Column: Form & Summary */}
        <div className={styles.leftCol}>
          
          <div className={`glass-panel ${styles.panel} animate-fade-in`}>
            <h2>💸 Yeni Harcama Ekle</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label>Başlık</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Shinkansen Bileti" required />
              </div>
              
              <div className={styles.row}>
                <div style={{flex: 1}}>
                  <label>Tutar (¥)</label>
                  <input type="number" step="1" className="input" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
                <div style={{flex: 1}}>
                  <label>Tarih</label>
                  <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>

              <div>
                <label>Kategori</label>
                <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label>Kim İçin Alındı?</label>
                <div className={styles.checkboxGroup}>
                  {users.map(u => (
                    <label key={u.id} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={participantIds.includes(u.id)}
                        onChange={() => toggleParticipant(u.id)}
                      />
                      <span>{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn" disabled={isSubmitting}>
                {isSubmitting ? 'Ekleniyor...' : 'Harcama Ekle'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: List */}
        <div className={styles.rightCol}>
          <div className={`glass-panel ${styles.panel} animate-fade-in`} style={{animationDelay: '0.1s'}}>
            <div className={styles.summaryBox} style={{marginBottom: '1.5rem'}}>
              <div className={styles.totalText}>Toplam Harcama: <strong>¥ {totalSpent.toFixed(0)}</strong></div>
            </div>
            <h2>📝 Harcama Geçmişi</h2>
            <div className={styles.expenseList}>
              {expenses.length === 0 ? (
                <p className={styles.emptyState}>Henüz harcama eklenmedi.</p>
              ) : expenses.map(exp => (
                <div key={exp.id} className={styles.expenseCard}>
                  <div className={styles.expIcon} style={{backgroundColor: exp.category.color + '40'}}>
                    {exp.category.icon}
                  </div>
                  <div className={styles.expDetails}>
                    <div className={styles.expHeader}>
                      <span className={styles.expTitle}>{exp.title}</span>
                      <span className={styles.expAmount}>¥ {exp.amount.toFixed(0)}</span>
                    </div>
                    <div className={styles.expMeta}>
                      <span>{new Date(exp.date).toLocaleDateString('tr-TR')}</span>
                      <span>•</span>
                      <span>{exp.participants.map(p => p.name).join(', ')} için</span>
                    </div>
                  </div>
                  <button onClick={() => deleteExpense(exp.id)} className={styles.deleteBtn} style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sil 🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
