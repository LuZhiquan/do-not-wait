import React from 'react';
import { Tabs, message } from 'antd';
import { inject, observer } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars'; //滚动条
import './right-memu.less';
const TabPane = Tabs.TabPane;

message.config({
  top: 300
});

// 菜品列表组件
function Dishes({ discontinuedStore, dishes, handleClick }) {
  return (
    <li onClick={handleClick}>
      <div className="dishes-info">
        <div
          className={
            dishes.productName.length > 5 ? 'title-small' : 'title-big'
          }
        >
          {dishes.productName}
        </div>
        {dishes.productType === 1 && <div className="taocan">套餐</div>}
      </div>
      <div className="dishes-price">¥{dishes.price} /份</div>
    </li>
  );
}

@inject('discontinuedStore')
@observer
class RightMemu extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { recordValue: '' };
  }

  componentDidMount() {
    let discontinuedStore = this.props.discontinuedStore;
    discontinuedStore.getFirstCategoryList(); //执行查询沽清列表  0是代表查询全部的
  }

  //menuID：菜单ID
  clickDishes(dishes) {
    let discontinuedStore = this.props.discontinuedStore;
    let _this = this;
    discontinuedStore.addHaltsSales(dishes.menuID, function() {
      _this.setState({ recordValue: '' });
      discontinuedStore.savesearch = '';
    });
  }

  //获取搜索的内容
  reachValue = e => {
    let discontinuedStore = this.props.discontinuedStore;
    var value = e.target.value;
    discontinuedStore.savesearch = value;
    this.setState({ recordValue: value });
    discontinuedStore.getDishesList({
      categoryID: '0',
      searchCode: e.target.value
    });
  };

  render() {
    let discontinuedStore = this.props.discontinuedStore;
    return (
      <div id="right-memu">
        <div className="dishes-category">
          <Tabs
            activeKey={discontinuedStore.firstCategoryID + ''}
            onTabClick={categoryID => {
              discontinuedStore.getSecondCategoryList(categoryID);
              this.setState({ recordValue: '' });
              discontinuedStore.savesearch = '';
            }}
          >
            {discontinuedStore.firstCategoryList.map(category => {
              return (
                <TabPane
                  tab={category.categoryName}
                  key={category.categoryID}
                />
              );
            })}
          </Tabs>
        </div>

        <div className="dishes-nav">
          <div className="nav-tabs">
            <Tabs
              activeKey={discontinuedStore.secondCategoryID + ''}
              onTabClick={categoryID => {
                discontinuedStore.getDishesList({ categoryID });
                this.setState({ recordValue: '' });
                discontinuedStore.savesearch = '';
              }}
            >
              {discontinuedStore.secondCategoryList.map(category => {
                return (
                  <TabPane
                    tab={category.categoryName}
                    key={category.categoryID}
                  />
                );
              })}
            </Tabs>
          </div>
          <div className="nav-search">
            <input
              type="text"
              placeholder="搜索菜品"
              onChange={this.reachValue}
              value={this.state.recordValue}
            />
            <i className="iconfont icon-order_btn_search" />
          </div>
        </div>

        <MyScroll>
          <ul className="dishes-list">
            {discontinuedStore.dishesList.length !== 0 ? (
              discontinuedStore.dishesList
                .concat(Array(10).fill(0))
                .map((dishes, index) => {
                  return dishes ? (
                    <Dishes
                      key={index}
                      discontinuedStore={discontinuedStore}
                      dishes={dishes}
                      handleClick={this.clickDishes.bind(this, dishes)}
                    />
                  ) : (
                    <li key={index} />
                  );
                })
            ) : (
              <div className="empty-holder">暂无数据</div>
            )}
          </ul>
        </MyScroll>
        <div className="dishes-pagination">
          <div>上一页</div>
          <div>下一页</div>
        </div>
      </div>
    );
  }
}

export default RightMemu;
