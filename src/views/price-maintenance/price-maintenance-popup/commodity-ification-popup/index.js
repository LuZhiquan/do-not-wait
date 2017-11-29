/**
* @author shining
* @description 商品分类页面
* @date 2017-05-19
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import { Tabs, Modal  } from 'antd';
import classnames from 'classnames';

import './commodity-ification-popup.less';

const TabPane = Tabs.TabPane;

@inject('priceMaintenanceStore') @observer
class CommodityIficationPopup extends Component {
	constructor(props,context){
		super(props,context);
		this.state = { 
			tabPosition: 'left',
            onelevelkey:'0',//一级分类的下标
            onelevelid:'',//一级分类id
            onelevelname:'',//一级分类name 
            twolevelid:'',//二级分类id
            twolevelname:'',//二级分类name
            changeclick:0,
            categoryID:''//纪录二级分类
		}
	}

	//点击取消按钮
	handleCancel=()=>{  
		if(this.props.closebutton){
			this.props.closebutton();
		} 
	}

    //点击确定按钮
    handleOk=()=>{ 
        
       let priceMaintenanceStore = this.props.priceMaintenanceStore;
       if(this.state.changeclick === 1){//说明有重新选择
             let lastid=this.state.onelevelid === "" ? this.state.twolevelid:this.state.onelevelid;
            let lastname=this.state.onelevelname === "" ? this.state.twolevelname:this.state.onelevelname;
            let lastkey=this.state.onelevelkey;
            if(this.state.twolevelname === ""){
                 priceMaintenanceStore.saveshop="";
            } 
            priceMaintenanceStore.savelastcombination(lastid,lastname,lastkey);

            priceMaintenanceStore.saveshop = this.state.categoryID;//为下一次打开页面被选中二级分类做储存
            
            
       }else{ 
           //否则维持之前的数据
           priceMaintenanceStore.savelastcombination(
               priceMaintenanceStore.lastcombination.lastid,
               priceMaintenanceStore.lastcombination.lastname,
               priceMaintenanceStore.lastcombination.lastkey,
               priceMaintenanceStore.lastcombination.twoleveid,
            );

       }
     



        if(this.props.okbutton) this.props.okbutton();
    }
 
	
	render() {
	   let priceMaintenanceStore = this.props.priceMaintenanceStore;
      let commodityclassif = priceMaintenanceStore.commodityclassifyList; 
 
		return (
			 <Modal title="商品分类" 
				visible={true} 
				maskClosable={false} 
				okText='确定' cancelText='取消'
				width={840} 
				wrapClassName="choose-class-popup-modal"
				onCancel={this.handleCancel}
				onOk={this.handleOk}
			 > 
				<Tabs defaultActiveKey={String(priceMaintenanceStore.lastcombination.lastkey)} className="message-left" tabPosition={this.state.tabPosition}>
				 

                     {(() =>{
                    if(commodityclassif.length) {
                        return commodityclassif.map((commodity,i) => {   
                            return  <TabPane key={i} tab={ <div  onClick={()=>{   
                                                                this.setState({
                                                                        onelevelkey:i,//一级分类的下标
                                                                        onelevelid:commodity.categoryID,//一级分类id
                                                                        onelevelname:commodity.categoryName,//一级分类name
                                                                        twolevelid:'',//清空二级分类id
                                                                        twolevelname:'', //清空二级分类name
                                                                        changeclick:1//标志为改动过
                                                                }) 

                                                        }}> {commodity.categoryName} </div> } >
                                            <div className="choose-person-right">
                                                <ul className="choose-person-content">
                                                    <Scrollbars>  
                                                         {commodity.children.map((child, index) => {  
                                                                return <li key={child.categoryID} 
                                                                            className={classnames({
                                                                                'choose-name-btn': true, 
                                                                                'selected':child.selected  
                                                                            })} 
                                                                            onClick={()=>{   
                                                                                 
                                                                                priceMaintenanceStore.selectcommodityclassify(child.categoryID) 
                                                                                if(child.selected){
                                                                                     this.setState({
                                                                                        twolevelid:child.categoryID,//二级id
                                                                                        twolevelname:child.categoryName,//二级name
                                                                                        onelevelid:'',//清空一级id
                                                                                        onelevelname:'', //清空一级name
                                                                                        onelevelkey:i,//一级分类的下标
                                                                                        changeclick:1,//标志维改动过
                                                                                        categoryID:child.categoryID 
                                                                                    }) 
                                                                                }else{
                                                                                    this.setState({
                                                                                        twolevelid:"",//二级id
                                                                                        twolevelname:"",//二级name
                                                                                        onelevelkey:i,//一级分类的下标
                                                                                        onelevelid:commodity.categoryID,//清空一级id
                                                                                        onelevelname:commodity.categoryName, //清空一级name
                                                                                        changeclick:1,//标志维改动过
                                                                                        categoryID:'' 
                                                                                    }) 
                                                                                     
                                                                                }
                                                                                
                                                                            
                                                                            }}>
                                                                            {child.categoryName}
                                                                      </li>
                                                            })}  
                                                            {commodity.children.length === 0 && <div className="empty-holder">暂无二级菜单</div>}
                                                    </Scrollbars>
                                                </ul>
                                            </div>
                                    </TabPane>
                        });
                    }
                    })()}   
				</Tabs>
			</Modal>
		)

	}

}


export default CommodityIficationPopup;