import React from 'react';
import {message} from 'antd';
import { observer, inject } from 'mobx-react'; 
import MyScroll from 'react-custom-scrollbars';//滚动条    
import Loading from 'components/loading';
import CommodityIficationPopup from './price-maintenance-popup/commodity-ification-popup';//商品分类   
import CommonKeyboardNum from '../price-maintenance/common-keyboard-num';//键盘  
import Promptspecialpopup from 'components/prompt-special-popup';//提示　
import Prompt from 'components/prompt-common';//错误提示
import classnames from 'classnames'; 
import 'assets/iconfont/iconfont.css'; 
import'assets/styles/modal.css';
import './price-maintenance.less'; 
 
 
message.config({
	top: 300 
});
 

//停售 
@inject('priceMaintenanceStore') @observer
class Discontinued extends React.Component {
 
    constructor(props, context) {
		super(props, context);   
        this.state={ 
            recordValue:'',//搜索内容文本框  
            CommodityIfication:'',//商品分类弹出层
            currentone:'0',//一层list
            currentwo:'',//二层list
            onepather:'0',//二层的父类下标
            clitype:"father",//点击类型 
            Promptpopup:'',//提示层 
            Promptspecialpopup:'',//特殊提示层
            loading:'',
            defaultvalue:'全部'

        };
         let priceMaintenanceStore=this.props.priceMaintenanceStore;  
         priceMaintenanceStore.getquery({categoryID:priceMaintenanceStore.lastcombination.lastid}); 
       
        
	} 

    
 
    componentDidUpdate() {
        let priceMaintenanceStore=this.props.priceMaintenanceStore;  
        let querylist=priceMaintenanceStore.querylist;
        let feedback = priceMaintenanceStore.feedback;
        if(feedback) {
        //提示
            switch(feedback.status) {
                case 'success':
                    message.success(feedback.msg,priceMaintenanceStore.closeFeedback());
                    break;
                case 'warn':
                    message.warn(feedback.msg,priceMaintenanceStore.closeFeedback());
                    break;
                case 'error':
                    message.warn(feedback.msg,priceMaintenanceStore.closeFeedback());
                    break;
                default:
                    message.info(feedback.msg,priceMaintenanceStore.closeFeedback());
            }
        }  
        
        document.onkeydown =(e)=>{
            
            if(e.which===13){   
                if(priceMaintenanceStore.inputIndex < (priceMaintenanceStore.suminput -1) && querylist.length >0){
                      this.Nextarticle();
                }
              
            }         
        } 
 
    }



    componentWillUnmount(){
        document.onkeydown=null;
    }

 

    
   
    //获取搜索的内容
    reachValue=(e)=>{
            var value = e.target.value;
            this.setState({recordValue:value});
    }

    //商品分类
    Classification=()=>{ 
        let priceMaintenanceStore=this.props.priceMaintenanceStore; 
        priceMaintenanceStore.getcommodityclassify(); 
        this.setState({
            CommodityIfication:
                <CommodityIficationPopup
                    closebutton={()=>{
                        this.setState({CommodityIfication:''});
                       
                    }}
                     okbutton={()=>{ 
                         this.setState({
                             CommodityIfication:'',
                             defaultvalue:  priceMaintenanceStore.lastcombination.lastname === ""  ? 
                                            '全部':
                                            priceMaintenanceStore.lastcombination.lastname
                            });

                         
                         priceMaintenanceStore.getquery({
                                categoryID:
                                            priceMaintenanceStore.lastcombination.lastid === "" 
                                            ? '0'
                                            : priceMaintenanceStore.lastcombination.lastid,
                                searchKey:this.state.recordValue
                        });//执行查询的操作
                        
                    }}
                >
                </CommodityIficationPopup>
        })
    }

    //查询
    quetyselect=()=>{
         let priceMaintenanceStore=this.props.priceMaintenanceStore;    
        
        if(priceMaintenanceStore.signb === 1){  
            this.setState({Promptspecialpopup:<Promptspecialpopup 
                                            cancelText={"继续查询"}　
                                            okText={"保存"}  
                                            footer={true}
                                            showconten={"还没保存修改,是否保存?"}
                                            onCancel={()=>{//关闭
                                               this.setState({Promptspecialpopup:''}); 
                                            }}
                                            cancelOpen={()=>{//继续查询
                                                this.setState({Promptspecialpopup:''}); 
                                                 priceMaintenanceStore.getquery({
                                                        categoryID:
                                                                    priceMaintenanceStore.lastcombination.lastid === "" 
                                                                    ? '0'
                                                                    : priceMaintenanceStore.lastcombination.lastid,
                                                        searchKey:this.state.recordValue
                                                });//执行查询的操作

                                                 this.props.priceMaintenanceStore.signb=0;

                                            }}
                                            onOk={()=>{//保存
                                                this.allsave();//执行保存的方法 
                                                this.setState({Promptspecialpopup:''});
                                            }}>
                                            
                                        </Promptspecialpopup>})
        }else{ 
            priceMaintenanceStore.getquery({
                    categoryID:
                                priceMaintenanceStore.lastcombination.lastid === "" 
                                ? '0'
                                : priceMaintenanceStore.lastcombination.lastid,
                    searchKey:this.state.recordValue
            });//执行查询的操作
        }
        
    }

    //全部保存
    allsave=()=>{ 
        let priceMaintenanceStore=this.props.priceMaintenanceStore; 
        let querylist=priceMaintenanceStore.querylist;  
        let lept=false;

        querylist.forEach(function(obj){  
            if(obj.changevalue === true){//取出被改动过的数据 
                

                if( obj.price.includes(".")){
                    if(obj.price.startsWith(".") || obj.price.endsWith(".") || obj.price.toString().split(".")[1].length>2){
                        lept=true;
                    } 
                }
                 
            }
             obj.child.forEach(function(objchild){ 
                 if(objchild.changevalue === true){//取出被改动过的数据
                     if( objchild.price.includes(".")){ 
                        if(objchild.price.startsWith(".") || objchild.price.endsWith(".") ||  objchild.price.toString().split(".")[1].length>2){
                            lept=true;
                        }  
                     } 
                }
                
             });   
        });   

        if(lept === true){
             message.destroy(); 
             message.warn("(输入价格格式有误/只能输入两位小数)请检查后再进行保存",3); 


        }else{
            this.setState({loading:true});  
            querylist.map(function(obj){  
                if(obj.changevalue === true){//取出被改动过的数据   
                    priceMaintenanceStore.curbSaleList.push({"typeID":obj.typeID,"productID":obj.productID,"price":obj.price*1+""}); 
                }
                 obj.child.map(function(objchild){
                    if(objchild.changevalue === true){//取出被改动过的数  
                        priceMaintenanceStore.curbSaleList.push({"typeID":objchild.typeID,"productID":objchild.productID,"price":objchild.price*1+""}); 
                    }
                    return objchild;
                 });  
                return obj;   
            });  
            priceMaintenanceStore.adjustpricepriceAdjustment(priceMaintenanceStore.curbSaleList,(success)=>{
                if(success){
                    this.setState({loading:''}); 
                }else{
                    this.setState({loading:''});
                }

            });//进行保持的操作
        }



      

         
    }

    //上一条
    Previousarticle=()=>{  
      let priceMaintenanceStore=this.props.priceMaintenanceStore;  
      if(priceMaintenanceStore.inputIndex>0){
         priceMaintenanceStore.saveshao();
      }
      
       let thisindex= priceMaintenanceStore.inputIndex;//上一个index  
       document.getElementById("inclouddiv").getElementsByTagName("input")[thisindex].focus();   
    }

    //下一条
    Nextarticle=()=>{ 

       let priceMaintenanceStore=this.props.priceMaintenanceStore;  
    //    let querylist=priceMaintenanceStore.querylist;
       priceMaintenanceStore.savejia();
       let thisindex= priceMaintenanceStore.inputIndex;  //下一个index
       document.getElementById("inclouddiv").getElementsByTagName("input")[thisindex].focus(); 
 
        
    } 

    //返回
    goback=()=>{ 
        let priceMaintenanceStore=this.props.priceMaintenanceStore;   
        
        if(priceMaintenanceStore.signb === 1){  
            this.setState({Promptspecialpopup:<Promptspecialpopup 
                                            cancelText={"继续返回"}　
                                            okText={"保存"} 
                                            footer={true}
                                            showconten={"还没保存修改,是否保存?"}
                                            onCancel={()=>{//关闭
                                               this.setState({Promptspecialpopup:''}); 
                                            }}
                                            cancelOpen={()=>{//继续返回 
                                                this.context.router.goBack();
                                                priceMaintenanceStore.signb = 0; 
                                                priceMaintenanceStore.savelastcombination('0','','0');//清空商品分类选中组合
                                                priceMaintenanceStore.saveshop='0';//恢复全部选项被选中
                                                priceMaintenanceStore.inputIndex=0;
                                            }}
                                            onOk={()=>{//保存
                                                this.allsave();//执行保存的方法 
                                                this.setState({Promptspecialpopup:''});
                                            }}>
                                            
                                        </Promptspecialpopup> 
                                })
        }else{
            this.context.router.goBack(); 
            priceMaintenanceStore.savelastcombination('0','','0');//清空商品分类选中组合
            priceMaintenanceStore.saveshop='0';//恢复全部选项被选中
            priceMaintenanceStore.inputIndex=0;
        }
        
    }



    inputData=(value)=> {  
        let querylist=this.props.priceMaintenanceStore.querylist;

        let currentone = this.state.currentone;//一级下表

        let currentwo = this.state.currentwo;//二级第二个下表
        let onepather = this.state.onepather;//二级第一个下表
        let clitype = this.state.clitype;
 
        if(clitype === "father"){    
            
            querylist[currentone].price=value; 
            querylist[currentone].changevalue=true;//说明这个数据被改动了
            this.props.priceMaintenanceStore.signb=1;//说明有要保存的数据 
           
        }

        if(querylist[onepather].child[currentwo] !== undefined){    
                 if(clitype === "son"){  
                    querylist[onepather].child[currentwo].price =value; 
                    querylist[onepather].child[currentwo].changevalue = true;//说明这个数据被改动了
                    this.props.priceMaintenanceStore.signb=1;//说明有要保存的数据
                }
            
        }
    
    
     
    }



  render() { 
    let priceMaintenanceStore=this.props.priceMaintenanceStore; 
    let querylist=priceMaintenanceStore.querylist;
    let feedback = priceMaintenanceStore.feedback;
    let operatePrompt; 
    let sumcount=0;
  
    
    if(feedback && feedback.status === 'error') {
        //错误提示
        feedback.okClick = () =>{
        if(feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
        }
        feedback.cancelClick = () =>{
        priceMaintenanceStore.closeFeedback();
        } 
        operatePrompt = <Prompt message={feedback} />
    }
 

    return ( 
        
       <div className="price-maintenance-modal"> 
            <div className="estimate-title">时价维护
                 <i className="iconfont icon-order_btn_back" 
                    onClick={this.goback}
                    >
                </i>
            </div>
            
             <div className="estimate-clear-main"> 
                        <div className="estimate-left">
                            <div className="estimate-left-search"> 
                                 <div className="div-shop" onClick={this.Classification}>
                                    {this.state.defaultvalue}
                                    <i className="iconfont icon-Shapearrow-"></i>
                                </div>
                                <input type="text" placeholder="请输入商品编码/名称/拼音码查询"  className="estimate-left-input" onKeyUp={this.reachValue}></input>
                                <button  className="search-box" onClick={this.quetyselect} > 
                                    <i className="iconfont icon-order_btn_search"></i>查询
                                </button>
                            </div>
                            <div className="main-block">
                                <div className="estimate-list-button"> 
                                    <div className="estimate-list"> 
                                        <MyScroll >     
                                        <div className="estimate-scroll" id="inclouddiv">  
                                            {(() =>{ 
                                            if(querylist.length === 0){
                                               return  <div className="empty-holder">暂无数据</div>
                                            } else {
                                                return querylist.map((msgobj,index) => {  
                                                    sumcount++;
                                                    return  <div className="each-data-main" key={index}>
                                                                <div className="each-data">
                                                                    <p><span>{msgobj.productName}</span></p>
                                                                    <p><span>单位：{msgobj.unitName}</span></p>
                                                                    <p><span>时价：
                                                                            <input  type="text"  
                                                                                    id={sumcount}  
                                                                                    className={priceMaintenanceStore.inputIndex === (sumcount-1) && 'changebg'}
                                                                                    value={msgobj.price || ''} 
                                                                                    onKeyDown={(e)=>{ 
                                                                                        if(msgobj.changevalue === false){
                                                                                            e.target.value="";
                                                                                        } 
                                                                                    }}
                                                                                    onChange={(e)=>{   
                                                                                        let lept =e.target.value;
                                                                                       
                                                                                        // document.onkeydown = function(e){
                                                                                        //     console.log("23423423");
                                                                                        //     if(msgobj.changevalue === false){
                                                                                        //         lept="";
                                                                                        //     } 
                                                                                        // } 
                                                                                       
                                                                                        if(/^\d*\.{0,1}\d*$/.test(e.target.value)){  
                                                                                            this.inputData(lept);
                                                                                        }
                                                                                    }} 
                                                                                    onFocus={(e)=>{ 
                                                                                        priceMaintenanceStore.inputIndex = e.target.id -1 ; 
                                                                                        this.setState({currentone:index,clitype:"father"});   
                                                                                    }}/>
                                                                        </span> 元 
                                                                    </p>
                                                                </div>
                                                                
                                                                {msgobj.child.length >0 &&
                                                                        <div className="each-child-list">
                                                                        {msgobj.child.map((cobj,i)=>{ 
                                                                                sumcount++;
                                                                            return  <div className="child-list" key={i}> 
                                                                                        <span>菜单:<em>{cobj.menuName}</em> </span>
                                                                                        <span>时价：
                                                                                            <input  type="text"  
                                                                                                    id={sumcount}   
                                                                                                    value={cobj.price ||''} 
                                                                                                    onKeyDown={(e)=>{ 
                                                                                                        if(cobj.changevalue === false){
                                                                                                            e.target.value="";
                                                                                                        } 
                                                                                                    }}
                                                                                                    onChange={(e)=>{  
                                                                                                        // querylist[index].child[i+1]=e.target.value;
                                                                                                        let lept =e.target.value;
                                                                                                        // if(cobj.changevalue === false){
                                                                                                        //     lept="";
                                                                                                        // }
                                                                                                        if(/^\d*\.{0,1}\d*$/.test(e.target.value)){ 
                                                                                                                
                                                                                                                this.inputData(lept);
                                                                                                        }
                                                                                                    }} 
                                                                                                    className={priceMaintenanceStore.inputIndex === (sumcount-1) && 'changebg'}
                                                                                                    onFocus={(e)=>{  
                                                                                                        priceMaintenanceStore.inputIndex = e.target.id -1 ;
                                                                                                        this.setState({currentwo:i,clitype:"son",onepather:index});   
                                                                                                    }}/> 元
                                                                                        </span> 
                                                                                    </div> 
                                                                        })}
                                                                        </div> 
                                                                }
                                                                    
                                                            </div> 
                                                });
                                            }
                                            })()}   
                                           
                                            
                                        </div>
                                        </MyScroll>
                                    </div>
                                    <div className="estimate-button">
                                        <button className={classnames({
                                            "disabled":querylist.length === 0
                                        })} onClick={querylist.length >0 && this.allsave}>全部保存</button> 
                                        <button className="hide">上一页</button> 
                                        <button className="disabled hide">下一页</button>  
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="estimate-right">
                            <div className="estimate-right-numkeyroed">
                                <CommonKeyboardNum  Whetherpoint={true} getvalue={(value)=>{ 
                                        let currentone = this.state.currentone;//一级下表

                                        let currentwo = this.state.currentwo;//二级第二个下表
                                        let onepather = this.state.onepather;//二级第一个下表
                                        let clitype = this.state.clitype;
                                        let pricetwo='';
                                        let priceone='';

                                      

                                      
 
                                        if(querylist[onepather].child[currentwo] !== undefined){
                                              
                                                 pricetwo = querylist[onepather].child[currentwo].price || ''; 
                                            
                                        }
 

                                        priceone = querylist[currentone].price || '';
 
                                       
                                       
                                        
                                        if(value === "click"){//数字键盘点击删除  
                                            if(clitype === "son"){ 
                                                querylist[onepather].child[currentwo].price=(pricetwo+'').substring(0,(pricetwo+'').length-1);
                                            }else if(clitype === "father"){
                                                querylist[currentone].price=(priceone+'').substring(0,(priceone+'').length-1);
                                            }

                                        }else{//追加数据
                                            if(clitype === "son"){  
                                                if(value === "." ){
                                                    if(querylist[onepather].child[currentwo].emptyvalue === false){
                                                        querylist[onepather].child[currentwo].price="";
                                                        querylist[onepather].child[currentwo].price="0.";
                                                        querylist[onepather].child[currentwo].emptyvalue= true;
                                                    }else{
                                                        if(String(pricetwo).indexOf(".") !== -1){
                                                            message.destroy();
                                                            message.warn("不能输入多个小数点");
                                                        }else if(pricetwo === ""){
                                                            querylist[onepather].child[currentwo].price = "0."; 
                                                        }else{
                                                            querylist[onepather].child[currentwo].price = pricetwo+value; 
                                                        }
                                                    }
                                                    
                                                }else{
                                                    if(querylist[onepather].child[currentwo].emptyvalue === false){
                                                         querylist[onepather].child[currentwo].price="";
                                                         querylist[onepather].child[currentwo].price=value;
                                                        querylist[onepather].child[currentwo].emptyvalue= true;
                                                    }else{
                                                        querylist[onepather].child[currentwo].price = pricetwo+value; 
                                                    }
                                                }
                                                 
                                               
                                                querylist[onepather].child[currentwo].changevalue = true;//说明这个数据被改动了
                                                priceMaintenanceStore.signb=1;//说明有要保存的数据
                                            }else if(clitype === "father"){  
                                                if(value === "."  ){ 
                                                    if(querylist[currentone].emptyvalue === false){
                                                        querylist[currentone].price=""; 
                                                        querylist[currentone].price="0.";
                                                        querylist[currentone].emptyvalue = true;
                                                    }else{
                                                        if(String(priceone).indexOf(".") !== -1){
                                                            message.destroy();
                                                            message.warn("不能输入多个小数点");
                                                        }else if(priceone === ""){
                                                            querylist[currentone].price = "0."; 
                                                        }else{
                                                            querylist[currentone].price=priceone+value;   
                                                        }
                                                    }
                                                    
                                                }else{
                                                    if(querylist[currentone].emptyvalue === false){
                                                        querylist[currentone].price=""; 
                                                         querylist[currentone].price=value;
                                                        querylist[currentone].emptyvalue = true;
                                                    }else{
                                                        querylist[currentone].price=priceone+value;  
                                                    }

                                                }
                                                
                                                querylist[currentone].changevalue=true;//说明这个数据被改动了
                                                priceMaintenanceStore.signb=1;//说明有要保存的数据
                                            }
                                        }
                                      


                                }}>
                                </CommonKeyboardNum>
                                <div className="show-button">
                                    <button className={classnames({
													"active": priceMaintenanceStore.inputIndex > 0 && querylist.length >0
												})}   
                                            onClick={(priceMaintenanceStore.inputIndex > 0 && querylist.length >0) && this.Previousarticle}>上一条
                                    </button>
                                    <button  className={classnames({
                                                    "active": priceMaintenanceStore.inputIndex < (priceMaintenanceStore.suminput -1) && querylist.length >0
                                                })} 
                                             onClick={(priceMaintenanceStore.inputIndex < (priceMaintenanceStore.suminput -1) && querylist.length >0)&& this.Nextarticle}>下一条
                                    </button>
                                </div>
                            </div>
                        </div>
                       
                        {this.state.CommodityIfication}
                        {this.state.Promptpopup}
                        {operatePrompt}
                        {this.state.Promptspecialpopup}
                        {this.state.loading&&<Loading/>}
             </div>
       </div>
    );
  }
}

Discontinued.wrappedComponent.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default Discontinued;
