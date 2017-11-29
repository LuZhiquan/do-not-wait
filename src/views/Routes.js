/**
* @author William Cui
* @description 路由配置容器
* @date 2017-03-27
**/
import React, { Component }from 'react';
import { Provider } from 'mobx-react';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

import appStore from 'stores/appStore';
import dineStore from 'stores/dineStore';
import memberStore from 'stores/memberStore';
import dishesStore from 'stores/dishesStore';
import settlementStore from 'stores/settlementStore';
import selloutStore from 'stores/selloutStore';
import bookingStore from 'stores/bookingStore';
import messageStore from 'stores/messageStore';
import orderStore from 'stores/orderStore';
import fastFoodOrderStore from 'stores/fastFoodOrderStore';
import responsibleStore from 'stores/responsibleStore';
import shiftStore from 'stores/shiftStore';
import discontinuedStore from 'stores/discontinuedStore';
import priceMaintenanceStore from 'stores/priceMaintenanceStore';
import checkInStore from 'stores/checkInStore';
import dayEndStore from 'stores/dayEndStore';
import smallTicketStore from 'stores/smallTicketStore';
import banquetCreateStore from 'stores/banquet/banquetCreateStore';
import banquetListStore from 'stores/banquet/banquetListStore';
import cashierStore from 'stores/cashierStore';
import dishesCashierStore from 'stores/dishesCashierStore';

const stores={
  appStore, 
  dineStore, 
  memberStore, 
  dishesStore, 
  settlementStore, 
  selloutStore, 
  bookingStore,
  messageStore,
  orderStore,
  fastFoodOrderStore,
  responsibleStore,
  shiftStore,
  discontinuedStore,
  priceMaintenanceStore,
  checkInStore,
  dayEndStore,
  smallTicketStore,
  banquetCreateStore,
  banquetListStore,
  cashierStore,
  dishesCashierStore
};

//根路由
const App=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./app').default)
  },'app')
}

//主结构
const Main=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./app/main').default)
  },'app')
}

//头部导航
const Header=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./app/header').default)
  },'app')
}

//配置收银机
const Config=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./config').default)
  },'app')
} 

//登录
const Login=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./login').default)
  },'app')
}

//桌台
const Dine=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./dine').default)
  },'dine')
}

//订单
const Order=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./order').default)
  },'order')
}

//快餐订单
const FastFoodOrder=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./fast-food-order').default)
  },'fast-food-order')
}

//会员
const Member=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./member').default)
  },'member')
}
//会员充值历史
const MemberHistory=(location, callback)=>{
   require.ensure([],require => {
    callback(null, require('./member/recharge-history').default)
  },'member')
}

//点菜
const Dishes=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./dishes').default)
  },'dishes')
}

//结账
const Settlement=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./settlement').default)
  },'settlement')
}

//预订
const Booking=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./booking').default)
  },'booking')
}
//预订首页
const BookingIndex=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./booking/booking').default)
  },'booking')
}
//预订搜索
const BookingSearch=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./booking/search').default)
  },'booking')
}
//创建预订
const BookingCreate=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./booking/create').default)
  },'booking')
}
//预订支付
const BookingPay=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./booking/pay').default)
  },'booking')
}

//宴会
const Banquet=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet').default)
  },'banquet')
}
//宴会首页
const BanquetIndex=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/banquet').default)
  },'banquet')
}
//宴会记录
const BanquetRecords=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/records').default)
  },'banquet')
}
//新建宴会
const BanquetCreate=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/create').default)
  },'banquet')
}
//宴会点菜
const BanquetDishes=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/dishes').default)
  },'banquet')
}
//宴会新增收定金
const BanquetReceive=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/create-beposit').default)
  },'banquet')
}
//宴会修改收定金
const BanquetAlter=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/modify-beposit').default)
  },'banquet')
}
//宴会结账
const BanquetPay=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/settlement').default)
  },'banquet')
}
//宴会收定金
const Beposit=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./banquet/beposit').default)
  },'banquet')
}

//沽清
const Sellout=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./sellout').default)
  },'sellout')
}
//估清后
const SelloutAfter=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./sellout/sellout-after').default)
  },'sellout')
}
//估清历史
const SelloutHistory=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./sellout/operation-history').default)
  },'sellout')
}

//消息中心
const Message=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./message').default)
  },'message')
}

//桌台负责人
const Responsible=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./responsible').default)
  },'responsible')
}

//交班
const Shift=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./shift').default)
  },'shift')
}
//交班主页面
const ShiftIndex=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./shift/shift').default)
  },'shift')
}
//交班记录
const ShiftRecords=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./shift/records').default)
  },'shift')
}

//停售
const Discontinued=(location, callback)=>{
   require.ensure([],require => {
    callback(null, require('./discontinued').default)
  },'discontinued')
}

//时价维护
const PriceMaintenance=(location, callback)=>{
   require.ensure([],require => {
    callback(null, require('./price-maintenance').default)
  },'price_maintenance')
}

//签到
const CheckIn=(location, callback)=>{
   require.ensure([],require => {
    callback(null, require('./check-in').default)
  },'check_in')
}

//日结
const DayEnd=(location, callback)=>{
   require.ensure([],require => {
    callback(null, require('./day-end').default)
  },'day_end')
}
//日结主页面
const DayEndIndex=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./day-end/day_end').default)
  },'day_end')
}
//日结记录
const DayEndRecords=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./day-end/records').default)
  },'day_end')
}

//重打小票
const SmallTicket=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./small-ticket').default)
  },'small_ticket')
}

//自选收银
const Cashier=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./cashier').default)
  },'cashier')
}

//点菜收银
const DishesCashier=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./dishes-cashier').default)
  },'dishes-cashier')
}

//点菜收银演示（双屏）
const Show=(location, callback) => {
  require.ensure([],require => {
    callback(null, require('./show').default)
  },'show')
}


class Routes extends Component {
  render() {
    return (
      <Provider {...stores}>
    		<Router history={browserHistory}>
          <Route path="/" getComponent={App}>
            <IndexRoute getComponent={Login}></IndexRoute>
            <Route path="/config" getComponent={Config} />
            <Route getComponent={Main}>
              <Route getComponent={Header}>
                <Route path="/dine" getComponent={Dine}></Route>
                <Route path="/order(/:orderCode)(/:orderStatus)" getComponent={Order}></Route>
                <Route path="/fast-food-order" getComponent={FastFoodOrder}></Route>
                <Route path="/member" getComponent={Member}></Route>
                <Route path='/booking' getComponent={Booking}>
                  <IndexRoute getComponent={BookingIndex}></IndexRoute>
                  <Route path='/booking/search' getComponent={BookingSearch}></Route>
                </Route>
                <Route path='/banquet' getComponent={Banquet}>
                  <IndexRoute getComponent={BanquetIndex}></IndexRoute>
                  <Route path='/banquet/records' getComponent={BanquetRecords}></Route>
                </Route>
                <Route path='/shift' getComponent={Shift}>
                  <IndexRoute getComponent={ShiftIndex}></IndexRoute>
                  <Route path='/shift/records' getComponent={ShiftRecords}></Route>
                </Route>
                <Route path='/cashier' getComponent={Cashier}></Route>
              </Route>
              <Route path='/dishes(/:tableID)(/:subOrderID)' getComponent={Dishes}></Route>
              <Route path='/settlement(/:tableID)(/:subOrderID)' getComponent={Settlement}></Route>
              <Route path='/member/history(/:cardID)'  getComponent={MemberHistory}></Route> 
              <Route path='/sellout' getComponent={Sellout}></Route>
              <Route path='/sellout/history' getComponent={SelloutHistory}></Route>
              <Route path='/sellout/after' getComponent={SelloutAfter}></Route>
              <Route path='/booking/create' getComponent={BookingCreate}></Route>
              <Route path='/booking/pay(/:bookingID)' getComponent={BookingPay}></Route>
              <Route path='/banquet/create' getComponent={BanquetCreate}></Route>
              <Route path='/banquet/dishes' getComponent={BanquetDishes}></Route>
              <Route path='/banquet/create-beposit' getComponent={BanquetReceive}></Route>
              <Route path='/banquet/modify-beposit' getComponent={BanquetAlter}></Route>
              <Route path='/banquet/settlement' getComponent={BanquetPay}></Route>
              <Route path='/banquet/beposit' getComponent={Beposit}></Route>
              <Route path='/message' getComponent={Message}></Route>
              <Route path='/responsible' getComponent={Responsible}></Route>
              <Route path='/discontinued' getComponent={Discontinued}></Route>
              <Route path='/price-maintenance' getComponent={PriceMaintenance}></Route>
              <Route path='/check-in' getComponent={CheckIn}></Route>
              <Route path='/day-end' getComponent={DayEnd}>
                <IndexRoute getComponent={DayEndIndex}></IndexRoute>
                <Route path='/day-end/records' getComponent={DayEndRecords}></Route>
              </Route>
              <Route path='/small-ticket/:subOrderID' getComponent={SmallTicket}></Route>
              <Route path='/dishes-cashier' getComponent={DishesCashier}></Route>
              <Route path='/show' getComponent={Show}></Route>
            </Route>
          </Route>
    		</Router>
      </Provider>
    )
  }
}

export default Routes;
