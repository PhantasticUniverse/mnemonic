import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/Dashboard';
import { ReviewPage } from '@/pages/Review';
import { CardsPage } from '@/pages/Cards';
import { TopicsPage } from '@/pages/Topics';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/topics" element={<TopicsPage />} />
        </Route>
        {/* Review page has its own layout */}
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
