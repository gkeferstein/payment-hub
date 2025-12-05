/**
 * Dashboard - Clean blocks.so style
 * Modern stat cards and recent activity
 */

import { useGetList } from 'react-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingUp, CheckCircle, CreditCard } from 'lucide-react';
import { Order, Payment } from '@/types';
import { format } from 'date-fns';

export const DashboardNew = () => {
  const { data: orders } = useGetList<Order>('orders', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  const { data: payments } = useGetList<Payment>('payments', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'created_at', order: 'DESC' },
  });

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter((o) => o.status === 'paid').length || 0;
  const totalPayments = payments?.length || 0;
  const successfulPayments = payments?.filter((p) => p.status === 'succeeded').length || 0;

  const totalRevenue =
    payments?.filter((p) => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0) || 0;

  const successRate = totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0;

  const recentOrders = (orders || []).slice(0, 5);
  const recentPayments = (payments || []).slice(0, 5);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Order Hub Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulPayments} of {totalPayments} payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.source_order_id}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {order.source}
                      </Badge>
                      <Badge
                        variant={
                          order.status === 'paid'
                            ? 'success'
                            : order.status === 'cancelled'
                            ? 'destructive'
                            : 'default'
                        }
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">€{order.grand_total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{payment.provider}</p>
                    <div className="flex items-center gap-2">
                      {payment.payment_method && (
                        <span className="text-xs text-muted-foreground">
                          {payment.payment_method}
                        </span>
                      )}
                      <Badge 
                        variant={payment.status === 'succeeded' ? 'success' : payment.status === 'failed' ? 'destructive' : 'default'} 
                        className="text-xs"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">€{payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No payments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

