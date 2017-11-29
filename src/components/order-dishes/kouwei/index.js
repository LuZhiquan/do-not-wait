import React from 'react';
import { Tabs} from 'antd';
import classnames from 'classnames';

import VerticalTabs from 'components/vertical-tabs';
import MyScroll from 'components/my-scrollbar';
import BeiZhu from '../beizhu';

const TabPane = Tabs.TabPane;

function Kouwei({ 
    attributeMap, 
    selectedAttributeList, 
    memo, 
    onChange,
    onEntry 
}) {
    return <div className="kouwei">
        <VerticalTabs>
        {Object.keys(attributeMap).map((key, index)=>{
            return <TabPane tab={key} key={index}>
            <MyScroll width={640} height={200}>
            {attributeMap[key].map((attribute, index)=>{
                return <li
                key={index}
                className={classnames({
                    "myBtn-120-38": true,
                    "myBtn-120-38-selected": attribute.selected
                })} onClick={() => {
                    //选择口味做法
                    let valueID = attribute.valueID;
                    let _attributeMap = {};
                    let _selectedAttributeList = [];
                    let groupID = attribute.groupID;
                    Object.keys(attributeMap).forEach(key => {
                        _attributeMap[key] = attributeMap[key].map((attribute, index) => {
                        if(groupID !== 822 && attribute.groupID !== 822) {
                            //其他做法只能单选
                            if(attribute.selected) {
                                attribute.selected = false;
                            }else {
                                attribute.selected = (attribute.valueID === valueID);
                            }
                        }else {
                            //口味支持多选
                            if(attribute.valueID === valueID) attribute.selected = !attribute.selected;
                        }
                        if(attribute.selected) {
                            _selectedAttributeList.push(attribute);
                        }
                        return attribute;
                        })
                    });
                    
                    onChange && onChange({
                        attributeMap: _attributeMap,
                        selectedAttributeList: _selectedAttributeList
                    });
                }}>
                    {attribute.attributeName}
                </li>
            })}
            </MyScroll>
            </TabPane>
        })}
        </VerticalTabs>
        {false && <div className="select-items">
            <div className="select-header">已选口味做法</div>
            <MyScroll width={800} height={106}>
            {selectedAttributeList && selectedAttributeList.length ? 
            selectedAttributeList.map((attribute, index)=>{
            return  <li 
                key={index} 
                className="myBtn-120-38-selected"
            >
                {attribute.attributeName}
                <i className="iconfont icon-shanchu1" onClick={() => {
                    let valueID = attribute.valueID;
                    let _attributeMap = {};
                    let _selectedAttributeList = selectedAttributeList || [];
                    Object.keys(attributeMap).forEach(key => {
                        _attributeMap[key]=attributeMap[key].map(attribute => {
                        if(attribute.valueID === valueID) {
                            attribute.selected = false;
                        }
                        return attribute;
                        })
                    });
                    _selectedAttributeList = selectedAttributeList.filter((attribute, index) => {
                        return attribute.valueID !== valueID;
                    });
                    onChange && onChange({
                        attributeMap: _attributeMap,
                        selectedAttributeList: _selectedAttributeList
                    });
                }}></i>
            </li>
            }) : <div className="empty-holder small" style={{marginTop: '60px'}}>请选择口味做法</div>}
            </MyScroll>
        </div>}
        <BeiZhu memo={memo || ''} onEntry={(memo) => {
            onEntry && onEntry(memo);
        }} />
    </div>
}

export default Kouwei;