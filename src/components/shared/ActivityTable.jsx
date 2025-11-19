import Table from '../ui/Table';
import Badge from '../ui/Badge';

const ActivityTable = ({ activities }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      DELIVERED: { variant: 'success', label: 'Đã giao' },
      PROCESSING: { variant: 'warning', label: 'Đang xử lý' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      DRAFT: { variant: 'default', label: 'Nháp' },
    };

    const config = statusMap[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>ID Đơn hàng</Table.Head>
          <Table.Head>Đại lý</Table.Head>
          <Table.Head>Giá trị</Table.Head>
          <Table.Head>Trạng thái</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {activities.map((activity) => (
          <Table.Row key={activity.id}>
            <Table.Cell className="font-medium">{activity.orderId}</Table.Cell>
            <Table.Cell>{activity.dealer}</Table.Cell>
            <Table.Cell>{activity.value}</Table.Cell>
            <Table.Cell>{getStatusBadge(activity.status)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ActivityTable;

