import request from './request';

export function createOrderDeposit(amount) {
  return request({
    url: '/user/order/save',
    method: 'post',
    data: {
      period: 'deposit',
      deposit_amount: amount,
      plan_id: 0 
    }
  });
}
