/**
* @author William Cui
* @description 打印小票界面
* @date 2017-06-12
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {message ,Table} from 'antd';
import MyScroll from 'react-custom-scrollbars';//滚动条   
import SmallTicketPopup from './small-ticket-popup';//重打详情  
import Prompt from 'components/prompt-common';//错误提示
import classnames from 'classnames'; 
import'./small-ticket.less';

message.config({
	top: 300 
});


 const columns = [
            {
                title: '单据名称',
                dataIndex: 'titlename',
                className:'data-title'
            
            } ,{
                title: '商品',
                dataIndex: 'commodity',
                className:'data-title' 
            },{
                title: '出品口',
                dataIndex: 'exportport',
                className:'data-title' 
            },{
                title: '打印机',
                dataIndex: 'printer',
                className:'data-title' 
            },{
                title: '打印次数',
                dataIndex: 'printtimes',
                className:'data-title' 
            } , 
            {
                title: '操作人',
                dataIndex: 'operator',
                className:'data-title' 
            } , 
            {
                title: '打印时间',
                dataIndex: 'printmme',
                className:'data-title' 
            } , 
            {
                title: '状态',
                dataIndex: 'stateprint',
                className:'data-title' 
            } , 
            {
                title: '重打查看',
                dataIndex: 'whamlook',
                className:'data-title' 
            } 
        ];
 
@inject('smallTicketStore') @observer
class SmallTicket extends Component {

    
    
    
    constructor(props, context) {
		super(props, context);   
        let smallTicketStore=this.props.smallTicketStore;  
        this.state={  
            selectedRowKeys: [],
            lempall:'',
            smallticket:''//重打查看页面
        } ;
        smallTicketStore.savesubOrderID(this.props.params.subOrderID); 
        smallTicketStore.getPrintListBySubOrder({subOrderID:this.props.params.subOrderID});
	}

    smallTicketStore = this.props.smallTicketStore;


    componentDidUpdate() { 
        let feedback = this.smallTicketStore.feedback; 
        if(feedback) {
        //提示
            switch(feedback.status) {
                case 'success':
                    message.success(feedback.msg,this.smallTicketStore.closeFeedback());
                    break;
                case 'warn':
                    message.warn(feedback.msg,this.smallTicketStore.closeFeedback());
                    break;
                case 'error':
                    message.warn(feedback.msg,this.smallTicketStore.closeFeedback());
                    break;
                default:
                    message.info(feedback.msg,this.smallTicketStore.closeFeedback());
            }
        }    
    }

     onSelectChange = (selectedRowKeys) => { 
        this.setState({ selectedRowKeys });
        let lemp= JSON.stringify(selectedRowKeys); 
        lemp = lemp.substr(1,lemp.length-2);
        this.setState({lempall:lemp})


    } 

    //重打详情
    whamdatil=()=>{
        if(this.state.lempall === ''){
            message.destroy();
             message.warn("请选中数据");   
        }else{ 
            this.smallTicketStore.getreprint({recordIDs:this.state.lempall})
            this.setState({selectedRowKeys:[]});
        }
      
        
    }


    render() { 
 
        let printobj =this.smallTicketStore.printobj;
        let printlist =this.smallTicketStore.printlist; 
        let feedback = this.smallTicketStore.feedback;
		let operatePrompt;
		if(feedback && feedback.status === 'error') {
			//错误提示
			feedback.okClick = () =>{
			if(feedback.confirmClick) feedback.confirmClick();
			feedback.cancelClick();
			}
			feedback.cancelClick = () =>{
			this.smallTicketStore.closeFeedback();
			}
			operatePrompt = <Prompt message={feedback} />
		}



        const {selectedRowKeys } = this.state;
        let dataeach=[];
        let rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        printlist.map(function(obj,i){  
            dataeach.push({
                key: obj.recordID,  
                titlename: obj.ticketName,//单据名称
                commodity: obj.productName,//商品名称
                exportport: obj.portName,//出品口
                printer: obj.printName,//打印机
                printtimes: obj.printNumber,//打印次数
                operator: obj.operator,//操作人
                printmme: obj.printTime,//打印时间
                stateprint: obj.printStatus,//状态
                whamlook:'查看'
            });
            return obj;
        }); 
 
        return <div id="small-ticket">
                 <div className="small-ticket-title">重打小票
                    <i className="iconfont icon-order_btn_back" 
                        onClick={() => { this.context.router.goBack();}}
                        >
                    </i>
                </div>
                <div className="small-ticket-top">
                    <span>订单号:<em> {printobj.orderID} </em></span>
                    <span>桌台名称:<em>{printobj.tableName}</em></span>
                    <span>开台时间:<em>{printobj.openTime}</em></span> 
                    <span>
                        <button  className={classnames({
                                        "disabled": printlist.length === 0
                                    })}  
                                onClick={printlist.length > 0  && this.whamdatil}>重打
                        </button>
                    </span>
                </div>
                <div className="small-ticket-datalist">
                    <div className="small-eachlist">
                      <MyScroll>
                            <Table 
                                rowSelection={rowSelection}   
                                columns={columns} 
                                dataSource={dataeach} 
                                pagination={false} 
                                onRowClick={(record, index)=>{  
                                    //每一行的点击事件
                                    this.smallTicketStore.getPrintHistory({recordID:record.key})
                                    this.setState({
                                         smallticket:
                                         <SmallTicketPopup 
                                            closebutton={()=>{
                                                this.setState({smallticket:''});
                                            }}
                                            okbutton={()=>{
                                                this.setState({smallticket:''});
                                            }}
                                            >
                                         </SmallTicketPopup>
                                    });
                                }}  
                                rowClassName={(record, index) => {
                                    return 'each-data';
                                }}  
                                
                            />  
                             {dataeach.length === 0 && <div className="empty-holder">暂无数据</div>}
                        </MyScroll>
                    </div>
                </div> 
                {operatePrompt}
                {this.state.smallticket}
        </div>
    }
}

SmallTicket.wrappedComponent.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default SmallTicket;
