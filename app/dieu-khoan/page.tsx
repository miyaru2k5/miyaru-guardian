import MainLayout from '../../layouts/MainLayout';
import SystemTermsSection from '../../components/SystemTermsSection';

export const metadata = {
  title: 'Điều khoản hệ thống',
  description: 'Tổng quan điều khoản và chính sách liên quan đến hệ thống.',
};

const SystemTermsPage = () => {
  return (
    <MainLayout>
      <SystemTermsSection />
    </MainLayout>
  );
};

export default SystemTermsPage;
