import React from 'react';
import { Tabs} from 'antd';

import './vertical-tab.css';
class VerticalTabs extends React.Component{

    render(){
        return(
      
        <div className="all-items" >
            <Tabs
            defaultActiveKey="0"
            tabPosition="left"  onChange={(index)=>{ 
              if(this.props.itemClick){
                  this.props.itemClick(index);
              }
           
            }} onTabClick={(index)=>{ 
              if(this.props.tabClick){
                  this.props.tabClick(index);
              }
           
            }}>
               {this.props.children}
            
            </Tabs>                    
        
        </div>
        
        )
    }

}

export default VerticalTabs;