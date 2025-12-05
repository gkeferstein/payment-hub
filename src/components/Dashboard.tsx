import { Card, CardContent, CardHeader, Grid } from '@mui/material';
import {
  ShoppingCart,
  Payment,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { useGetList } from 'react-admin';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard = ({ title, value, icon, color = '#1976d2' }: StatCardProps) => (
  <Card>
    <CardContent>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
            {value}
          </div>
        </div>
        <div style={{ color, opacity: 0.5, fontSize: '3rem' }}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useGetList('orders', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  // Fetch payments
  const { data: payments, isLoading: paymentsLoading } = useGetList('payments', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter((o: any) => o.status === 'paid').length || 0;
  const totalPayments = payments?.length || 0;
  const successfulPayments = payments?.filter((p: any) => p.status === 'succeeded').length || 0;
  
  const totalRevenue = payments
    ?.filter((p: any) => p.status === 'succeeded')
    .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  const successRate = totalPayments > 0 
    ? Math.round((successfulPayments / totalPayments) * 100) 
    : 0;

  if (ordersLoading || paymentsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Order Hub Dashboard</h1>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid Orders"
            value={paidOrders}
            icon={<CheckCircle />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`€${totalRevenue.toFixed(2)}`}
            icon={<TrendingUp />}
            color="#ed6c02"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={<Payment />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} style={{ marginTop: 20 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Orders" />
            <CardContent>
              {orders?.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{order.source_order_id}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {order.source} • {order.status}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    €{order.grand_total.toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Payments" />
            <CardContent>
              {payments?.slice(0, 5).map((payment: any) => (
                <div
                  key={payment.id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{payment.provider}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {payment.payment_method} • {payment.status}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    €{payment.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};




