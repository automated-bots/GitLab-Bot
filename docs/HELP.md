# Documentation

General documentation about LBRY (pronounced as 'Library'). LBRY is a decentralized blockchain-based content sharing application using the LBRY protocol specifiction.

Read the [lbry overview page](https://lbry.tech/overview).

I'll discuss the most important projects down below.

```
                                             ++                                            
                                           :+++++                                          
                                          +++++++++                                        
                                        '++++++++++++`                                     
                                      .++++++',++++++++`                                   
                                     +++++++    .++++++++.                                 
                                   ;++++++:       `++++++++,                               
                                  +++++++            ++++++++,                             
                                +++++++`               ++++++++:                           
                              ,++++++'                   ++++++++;                         
                             +++++++                       ++++++++'                       
                           '++++++,                          ++++++++'                     
                         `+++++++                              '++++++++                   
                        +++++++                                  '++++++++                 
                      :++++++;                                     ;++++++++               
                     +++++++                                         :++++++++             
                   '++++++.                                            ,++++++++           
                 .++++++'                                                ,++++++++`        
                +++++++                                                    .++++++++`      
              ;++++++,                                                       `+++++++      
            `+++++++                                                           `+++++      
           +++++++`                                                              ++++      
         :++++++;                                                               +++++      
        +++++++                                                               ,++++++      
      '++++++.                                                               +++++++       
    .++++++'                                                               '++++++,        
   +++++++                                                               `+++++++          
   +++++:                                                               +++++++            
   ++++                                                               ;++++++:             
   ++++                                                              +++++++               
   ++++      ++                                                    +++++++`                
   ++++      ++++                                                ,++++++'             .:   
   ++++      ++++++                                             +++++++     :'++++++++++   
   ++++      ++++++++                                         '++++++.       ++++++++++    
   ++++       :++++++++                                     .++++++'         .+++++++++    
   ++++         :++++++++                                  +++++++            ++++++++.    
   ++++           ,++++++++                              ;++++++:            :++++++++     
   ++++             ,++++++++                          `+++++++             +++++++++,     
   ++++               ,++++++++                       +++++++`            +++++++++++      
   +++++.               .++++++++`                  :++++++;            ,+++++++ +++;      
   +++++++.               .++++++++`               +++++++             +++++++    ++       
    ++++++++,               `++++++++`           '++++++.            '++++++:     ,'       
      ++++++++,               `++++++++`       .++++++'            .+++++++                
        ++++++++,               `++++++++.    +++++++             +++++++`                 
          ++++++++,                ++++++++.'++++++,            ;++++++;                   
            ++++++++:                +++++++++++++            `+++++++                     
              ++++++++:                +++++++++`            +++++++.                      
                ++++++++:                +++++;            ,++++++'                        
                  ++++++++:                ++             +++++++                          
                    ++++++++;                           '++++++,                           
                      '+++++++;                       .+++++++                             
                        '+++++++;                    +++++++                               
                          '+++++++;                ;++++++:                                
                            '+++++++'            `+++++++                                  
                              '+++++++'         +++++++`                                   
                                '+++++++'     :++++++;                                     
                                  ;+++++++'  +++++++                                       
                                    ;+++++++++++++.                                        
                                      ;+++++++++'                                          
                                        ;++++++                                            
                                          :++,
```

## lbry-sdk

The easy-to-develop application from LBRY, it implements the LBRY protocol specification (except the blockchain protocol), extra components for developers and deamon that participates in the LBRY data network + API to interact with the protocol.

* [lbry-sdk API](https://lbry.tech/api/sdk) (using the lbry-sdk deamon API)
* [Download librynet](https://github.com/lbryio/lbry-sdk/releases)

Run the deamon, via: `./lbrynet start`

API CLI status request (example): `curl -d'{"method": "status", "params": {}}' http://localhost:5279/`

*Note:* lbrycrd is not required for the SDK, since it's using SPV (a scheme to validate transactions without storing the whole blockchain = lbryum) by default instead of the full blockchain/full node (lbrycrd).

## Chainquery

Chainquery takes all the raw data in the blockchain, decompresses and extracts it, and stores it in a relational database, all in real-time. This allows the rich features of SQL to be applied to live blockchain data.

Chainquery is programmed in the Go language, and requires lbrycrd.

* [Chainquery Github source-code](https://github.com/lbryio/chainquery)
* [Chainquery schema](https://github.com/lbryio/chainquery/blob/master/db/chainquery_schema.sql)

There is also a public API available, just two examples:

* Get the latest block information: `https://chainquery.lbry.com/api/sql?query=SELECT * FROM block ORDER BY height DESC LIMIT 1`
* Get all claims and their details for the name "lbry": `https://chainquery.lbry.com/api/sql?query=SELECT * FROM claim WHERE name = "lbry"`

## lbrycrd

The **official** implementation of the LBRY blockchain protocol. The core of LBRY.

* [lbrycrd Github source-code](https://github.com/lbryio/lbrycrd)
* [lbrycrd spec doc](lbry-spec.pdf)
* [lbrycrd API](https://lbry.tech/api/blockchain) (using the lbrycrd daemon API)


