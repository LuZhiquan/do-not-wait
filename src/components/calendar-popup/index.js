import React from 'react';    
import DatePicker from 'react-mobile-datepicker';

import './calendar_popup.css'; 
class CalendarPopup extends React.Component {
	 
	state = {
		time: this.props.defaultTime || new Date()
	}
	
	handleCancel = () => {  
		if(this.props.calendarModalCancel){
				this.props.calendarModalCancel();
		}
		
	}

	handleSelect = (time) => {  
		
		this.setState(time);
		var year = time.getFullYear();
		var month = time.getMonth()+1;
		if(month<=9){
			month="0"+month;
		}
		var day = time.getDate();
		if(day<=9){
			day='0'+day;
		}

		var newtime = year+'-'+month+'-'+day;
		if(this.props.calendarModalOk){
				this.props.calendarModalOk(newtime);
		}  
	}

	render() {
		if(this.props.minTime){
			return (			
				<div className="App"> 
					<DatePicker
						isPopup={true}
						value={this.state.time}
						isOpen={true}
						min={this.props.minTime}
						onSelect={this.handleSelect}
						onCancel={this.handleCancel} 
						dateFormat={['YYYY', 'MM', 'DD']}
						theme='ios' />
				</div>
			);

		}else if(this.props.maxTime){ 
			return <div className="App"> 
					<DatePicker
						isPopup={true}
						value={this.props.changetime}
						isOpen={true}
						max={this.props.maxTime}
						onSelect={this.handleSelect}
						onCancel={this.handleCancel} 
						dateFormat={['YYYY', 'MM', 'DD']}
						theme='ios' />
				</div>

		}else{  
			return (	
				
				<div className="App"> 
					<DatePicker
						value={JSON.stringify(this.props.changetime) === undefined ? this.state.time : this.props.changetime}
						isOpen={true}
						
						onSelect={this.handleSelect}
						onCancel={this.handleCancel} 
						dateFormat={['YYYY', 'MM', 'DD']}
						theme='ios' />
				</div>
			);
		}
		
	}
}


export default CalendarPopup;