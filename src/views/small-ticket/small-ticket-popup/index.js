
/**
* @author shining
* @description 重打详情
* @date 2017-05-26
**/
import React from 'react'; 
import { Modal ,Table} from 'antd'; 
import { inject, observer} from 'mobx-react';
import MyScroll from 'react-custom-scrollbars';
import './small-ticket-popup.less';

const columns = [
    {
        title: '序号',
        dataIndex: 'index',
        className:'data-title'
     
    }, 
    {
        title: '打印机',
        dataIndex: 'printer',
        className:'data-title' 
    }, 
    {
        title: '操作人',
        dataIndex: 'operator',
        className:'data-title' 
    }, 
    {
        title: '打印时间',
        dataIndex: 'printtime',
        className:'data-title' 
    }, 
    {
        title: '状态',
        dataIndex: 'state',
        className:'data-title' 
    }
];
@inject('smallTicketStore') @observer
class SmallTicketPopup extends React.Component {

  //取消关闭的按钮
  handleCancel=()=>{
    if(this.props.closebutton){
      this.props.closebutton();
    } 
  }

   //确定的按钮
  okCancel=()=>{
    if(this.props.okbutton){
      this.props.okbutton();
    } 
  }

  
  smallTicketStore=this.props.smallTicketStore;


  render() {    
    let printhistoryobj =this.smallTicketStore.printhistoryobj;
    let printhistorylist =this.smallTicketStore.printhistorylist; 
    let dataeach=[]; 
    printhistorylist.map(function(obj,i){  
        dataeach.push({
            key:i,  
            index: i+1,//序号
            printer: obj.printName,//打印机
            operator: obj.operator,//操作人
            printtime: obj.printTime,//打印时间 
            state: obj.printStatus//状态 
        });
        return obj;
    }); 
    return (
       <div>
          <Modal title="重打查看"
              visible={true}   
              onCancel={this.handleCancel} 
              footer={null}
              width={840} wrapClassName="small-ticket-popup-modal"  
            >
            <div className="small-ticket-main">
              <div className="small-ticket-title">
                  <span>单据名称:<em>{printhistoryobj.ticketName}</em></span>
                  <span>商品名:<em>{printhistoryobj.productName}</em></span> 
                  <span>出品口:<em>{printhistoryobj.portName}</em></span>
              </div>
              <div className="data-list-main">
                   <MyScroll>
                        <Table   
                            columns={columns} 
                            dataSource={dataeach} 
                            pagination={false}  
                            rowClassName={(record, index) => {
                                return 'each-data';
                            }}   
                        />  
                        {dataeach.length === 0 && <div className="empty-holder">暂无数据</div>}
                    </MyScroll>
              </div>
            </div>
            <div className="Prompt_button" onClick={this.okCancel}>确定</div> 

          </Modal> 
       </div>
    );
  }
}

export default SmallTicketPopup;