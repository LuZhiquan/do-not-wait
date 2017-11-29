import React from 'react';
import { Tabs, message } from 'antd';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router';
import MyScroll from 'react-custom-scrollbars'; //横向滚动条
import UpdateEstimatePopup from '../update-estimate-popup'; //添加沽清数量
import './right-memu.less';
const TabPane = Tabs.TabPane;

message.config({
  top: 300
});

// 菜品列表组件
function Dishes({ selloutStore, dishes, handleClick }) {
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
        {dishes.productType === 1 && <div className="taocan">套餐</div>}{' '}
      </div>
      <div className="dishes-price">¥{dishes.price} /份</div>
    </li>
  );
}

@inject('selloutStore')
@observer
class RightMemu extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { UpdateEstimate: '', recordValue: '' };
  }

  componentDidMount() {
    let selloutStore = this.props.selloutStore;
    selloutStore.getFirstCategoryList(); //查询商品分类
    selloutStore.getTakeeffect(); //判断是否生效
  }

  //menuID：菜单ID
  clickDishes(dishes) {
    let selloutStore = this.props.selloutStore;
    if (selloutStore.Takeeffect === true) {
      if (window.location.pathname === '/sellout') {
        browserHistory.push('/sellout/after'); //生效后
      } else {
        //menuID：菜单ID(必填)
        let _this = this;
        this.props.selloutStore.getselloutMessage(dishes.menuID, function(
          messageobj
        ) {
          if (messageobj.accOptionCureSale === true) {
            _this.props.selloutStore.optionIDSum =
              dishes.optionIDSum > 0 ? 1 : 0;
          } else if (messageobj.accOptionCureSale === false) {
            _this.props.selloutStore.optionIDSum = 2;
          }

          _this.props.selloutStore.savemenuID = dishes.menuID;
          _this.props.selloutStore.menuname = dishes.productName;

          _this.setState({
            UpdateEstimate: (
              <UpdateEstimatePopup
                updateestime={() => {
                  _this.setState({ UpdateEstimate: '' });
                  _this.props.selloutStore.emptylist();
                }}
                okdateestime={obj => {
                  if (_this.props.whatpopup) {
                    _this.props.whatpopup();
                  }
                  _this.setState({ UpdateEstimate: '', recordValue: '' });
                  _this.props.selloutStore.emptylist();
                }}
              />
            )
          });
        });
      }
    } else if (selloutStore.Takeeffect === false) {
      //menuID：菜单ID(必填)
      let _this = this;
      this.props.selloutStore.getselloutMessage(dishes.menuID, function(
        messageobj
      ) {
        if (messageobj.accOptionCureSale === true) {
          _this.props.selloutStore.optionIDSum = dishes.optionIDSum > 0 ? 1 : 0;
        } else if (messageobj.accOptionCureSale === false) {
          _this.props.selloutStore.optionIDSum = 2;
        }
        _this.props.selloutStore.savemenuID = dishes.menuID;
        _this.props.selloutStore.menuname = dishes.productName;
        _this.setState({
          UpdateEstimate: (
            <UpdateEstimatePopup
              updateestime={() => {
                _this.setState({ UpdateEstimate: '' });
                _this.props.selloutStore.emptylist();
              }}
              okdateestime={() => {
                if (_this.props.whatpopup) {
                  _this.props.whatpopup();
                }
                _this.setState({ UpdateEstimate: '', recordValue: '' });
                _this.props.selloutStore.emptylist();
              }}
            />
          )
        });
      });
    }
  }

  //获取搜索的内容
  reachValue = e => {
    let selloutStore = this.props.selloutStore;
    var value = e.target.value;
    selloutStore.recordValue = value;
    this.setState({ recordValue: value });
    if (selloutStore.Takeeffect === true) {
      browserHistory.push('/sellout/after'); //生效后
      selloutStore.getDishesList({
        categoryID: '0',
        searchCode: e.target.value
      });
    } else if (selloutStore.Takeeffect === false) {
      selloutStore.getDishesList({
        categoryID: '0',
        searchCode: e.target.value
      });
    }
  };

  render() {
    let selloutStore = this.props.selloutStore;
    return (
      <div id="right-memu">
        <div className="dishes-category">
          <Tabs
            activeKey={selloutStore.firstCategoryID}
            onTabClick={categoryID => {
              this.setState({ recordValue: '' });
              selloutStore.recordValue = '';
              if (selloutStore.Takeeffect === true) {
                browserHistory.push('/sellout/after'); //生效后
                selloutStore.getSecondCategoryList(categoryID);
              } else if (selloutStore.Takeeffect === false) {
                selloutStore.getSecondCategoryList(categoryID);
              }
            }}
          >
            {selloutStore.firstCategoryList.map(category => {
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
              activeKey={selloutStore.secondCategoryID}
              onTabClick={categoryID => {
                this.setState({ recordValue: '' });
                selloutStore.recordValue = '';
                if (selloutStore.Takeeffect === true) {
                  browserHistory.push('/sellout/after'); //生效后
                  selloutStore.getDishesList({ categoryID });
                } else if (selloutStore.Takeeffect === false) {
                  selloutStore.getDishesList({ categoryID });
                }
              }}
            >
              {selloutStore.secondCategoryList.map(category => {
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
            {selloutStore.dishesList
              .concat(Array(10).fill(0))
              .map((dishes, index) => {
                return dishes ? (
                  <Dishes
                    key={index}
                    selloutStore={selloutStore}
                    dishes={dishes}
                    handleClick={this.clickDishes.bind(this, dishes)}
                  />
                ) : (
                  <li key={index} />
                );
              })}
            {selloutStore.dishesList.length === 0 && (
              <div className="empty-holder">暂无菜品</div>
            )}
          </ul>
        </MyScroll>
        <div className="dishes-pagination">
          <div>上一页</div>
          <div>下一页</div>
        </div>
        {this.state.UpdateEstimate}
      </div>
    );
  }
}

export default RightMemu;
