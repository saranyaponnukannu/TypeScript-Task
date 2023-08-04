import * as fs from 'fs';
import { parse } from 'js2xmlparser';
import { start } from 'repl';
import { create } from 'xmlbuilder2';

interface GuestBookings{
   guestName:string;
   checkInDate:string;
   checkOutDate:string;
   roomType:string;
   totalAmount:number;
}

interface FinancialTransactions{

    guestName:string;
    transactionType:string;
    amount:number;

}

function readGuestBookings():GuestBookings[]{
   try{
       const jsonString = fs.readFileSync("./test/guestBookings.json", 'utf-8');
       const jsonData = JSON.parse(jsonString);
       return jsonData;
   }
  catch(err){
      console.log(err);
      return [];
  }
}
console.log(readGuestBookings());

function readFinancialTransactions():FinancialTransactions[]{
    try{
        const jsonString = fs.readFileSync("./test/financialTransactions.json", 'utf-8');
        const jsonData = JSON.parse(jsonString);
        return jsonData;
    }
   catch(err){
       console.log(err);
       return [];
   }
 }
 console.log(readFinancialTransactions());

function generateFinancialPostings(financialTransactions:FinancialTransactions[])
{
    const groupedTansType = groupBy(financialTransactions, (type) => type.transactionType);
    console.log(groupedTansType);
    convertFinancialPostingsToXML(groupedTansType);
    
}

function groupBy<T, K>(array: T[], getKey: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>();
  
    array.forEach((item) => {
      const key = getKey(item);
      const group = groups.get(key) || [];
      group.push(item);
      groups.set(key, group);
    });
  
    return groups;
    
  }
generateFinancialPostings(readFinancialTransactions());


 function generateFinancialCharges(guestBookings: GuestBookings[], financialTransactions: FinancialTransactions[]): Map<string, number> {
    const financialChargesMap: Map<string, number> = new Map();

    for (const booking of guestBookings) {
        let totalAmount = booking.totalAmount;

        for (const transaction of financialTransactions) {
            if (booking.guestName === transaction.guestName) {
                totalAmount -= transaction.amount;
            }
        }

        financialChargesMap.set(booking.guestName, totalAmount);
    }
    
    convertFinancialChargesToXML(financialChargesMap);
    const financialChargesMapCopy = new Map(financialChargesMap);
    const financialChargesObject = Object.fromEntries(financialChargesMap);
    const jsonString = JSON.stringify(financialChargesObject, null, 2);
    fs.writeFileSync("./jsonfile/financialCharges.json", jsonString);
    return financialChargesMap;
    
  
   
}

console.log(generateFinancialCharges(readGuestBookings(), readFinancialTransactions()));

function convertFinancialPostingsToXML(groupedTansType: Map<string, FinancialTransactions[]>){
    const xml = Array.from(groupedTansType).reduce((result, [transactionType, transactions]) => {
      result += `  <${transactionType}>\n`;
      transactions.forEach((transaction) => {
        result += `      <GuestName>${transaction.guestName}</GuestName>\n`;
        result += `      <Amount>${transaction.amount}</Amount>\n`;
      });
      result += `  </${transactionType}>\n`;
      return result;
    },'<FinancialPostings>\n');

    console.log(xml + '</FinancialPostings>');
    writeXMLFile(xml + '</FinancialPostings>',"./xmlfile/financialPostings.xml");
  }

  
function convertFinancialChargesToXML(financialChargesMap: Map<string, number>) {

    const xml = Array.from(financialChargesMap).reduce((result, [guestName, totalAmount]) => {
      result += `  <Guest>\n`;
      result += `      <GuestName>${guestName}</GuestName>\n`;
      result += `      <TotalAmount>${totalAmount}</TotalAmount>\n`;
      result += `  </Guest>\n`;
      return result;
    },'<FinancialCharges>\n');
    console.log(xml + '</FinancialCharges>');
     writeXMLFile(xml + '</FinancialCharges>',"./xmlfile/financialCharges.xml");
    

}

function writeXMLFile(xml: string, fileName: string): void {
    fs.writeFile(fileName, xml, (err) => {
      if (err) {
        console.error(err);
      }
    });
    
  }


