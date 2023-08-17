#############################################
#  This is the Python script that parses a .avb or .bin file
#  into 256-byte payloads and frames each in a WSLIP datagram
#  and outputs an array of these packets to the Express server.
#
#  Largely replicates functionality of PilotTerm Updater.cs,
#  minus the direct communication with EVSE.
#############################################
import sys
import json
import requests

# define constants
PAYLOAD_SIZE = 256
WRITE_COMMAND = 1
START_ADDRESS = 0x4000
SOURCE_ID = 0x30
DESTINATION_ID = 0x20
FLASH_WRITE_REQUEST = 0x0B
FLASH_WRITE_RESPONSE = 0x0C

END = 0x0DB
ESC = 0xC0
ESC_END = 0xDC
ESC_ESC = 0xDD

CRC16_TABLE=[0x0000,0xc0c1,0xc181,0x0140,0xc301,0x03c0,0x0280,0xc241,
             0xc601,0x06c0,0x0780,0xc741,0x0500,0xc5c1,0xc481,0x0440,
             0xcc01,0x0cc0,0x0d80,0xcd41,0x0f00,0xcfc1,0xce81,0x0e40,
             0x0a00,0xcac1,0xcb81,0x0b40,0xc901,0x09c0,0x0880,0xc841,
             0xd801,0x18c0,0x1980,0xd941,0x1b00,0xdbc1,0xda81,0x1a40,
             0x1e00,0xdec1,0xdf81,0x1f40,0xdd01,0x1dc0,0x1c80,0xdc41,
             0x1400,0xd4c1,0xd581,0x1540,0xd701,0x17c0,0x1680,0xd641,
             0xd201,0x12c0,0x1380,0xd341,0x1100,0xd1c1,0xd081,0x1040,
             0xf001,0x30c0,0x3180,0xf141,0x3300,0xf3c1,0xf281,0x3240,
             0x3600,0xf6c1,0xf781,0x3740,0xf501,0x35c0,0x3480,0xf441,
             0x3c00,0xfcc1,0xfd81,0x3d40,0xff01,0x3fc0,0x3e80,0xfe41,
             0xfa01,0x3ac0,0x3b80,0xfb41,0x3900,0xf9c1,0xf881,0x3840,
             0x2800,0xe8c1,0xe981,0x2940,0xeb01,0x2bc0,0x2a80,0xea41,
             0xee01,0x2ec0,0x2f80,0xef41,0x2d00,0xedc1,0xec81,0x2c40,
             0xe401,0x24c0,0x2580,0xe541,0x2700,0xe7c1,0xe681,0x2640,
             0x2200,0xe2c1,0xe381,0x2340,0xe101,0x21c0,0x2080,0xe041,
             0xa001,0x60c0,0x6180,0xa141,0x6300,0xa3c1,0xa281,0x6240,
             0x6600,0xa6c1,0xa781,0x6740,0xa501,0x65c0,0x6480,0xa441,
             0x6c00,0xacc1,0xad81,0x6d40,0xaf01,0x6fc0,0x6e80,0xae41,
             0xaa01,0x6ac0,0x6b80,0xab41,0x6900,0xa9c1,0xa881,0x6840,
             0x7800,0xb8c1,0xb981,0x7940,0xbb01,0x7bc0,0x7a80,0xba41,
             0xbe01,0x7ec0,0x7f80,0xbf41,0x7d00,0xbdc1,0xbc81,0x7c40,
             0xb401,0x74c0,0x7580,0xb541,0x7700,0xb7c1,0xb681,0x7640,
             0x7200,0xb2c1,0xb381,0x7340,0xb101,0x71c0,0x7080,0xb041,
             0x5000,0x90c1,0x9181,0x5140,0x9301,0x53c0,0x5280,0x9241,
             0x9601,0x56c0,0x5780,0x9741,0x5500,0x95c1,0x9481,0x5440,
             0x9c01,0x5cc0,0x5d80,0x9d41,0x5f00,0x9fc1,0x9e81,0x5e40,
             0x5a00,0x9ac1,0x9b81,0x5b40,0x9901,0x59c0,0x5880,0x9841,
             0x8801,0x48c0,0x4980,0x8941,0x4b00,0x8bc1,0x8a81,0x4a40,
             0x4e00,0x8ec1,0x8f81,0x4f40,0x8d01,0x4dc0,0x4c80,0x8c41,
             0x4400,0x84c1,0x8581,0x4540,0x8701,0x47c0,0x4680,0x8641,
             0x8201,0x42c0,0x4380,0x8341,0x4100,0x81c1,0x8081,0x4040]

# AVPacket class based off of PilotTerm AVPacket.cs class
# this class creates WSLIP message objects
class AVPacket:

  # from PilotTerm: AVPacket.cs.26
  def __init__(self, source_id, destination_id, counter, flash_write_cmd, message_packet):
    self.source_id = source_id
    self.destination_id = destination_id
    self.counter = counter
    self.messageID = flash_write_cmd
    self.messagePacket = message_packet
    self.messageLength = len(message_packet)
    self.byteArray = bytearray()
    self.encodeMessage()

  def encodeMessage(self):
    self.buildPacket()
    self.addCRC()
    self.replaceEndEsc()
    self.addEndTags()
    return True
    
  def buildPacket(self):
    self.byteArray.extend(convert_to_bytes(self.source_id))
    self.byteArray.extend(convert_to_bytes(self.destination_id))
    self.byteArray.extend(convert_to_bytes(self.counter))
    self.byteArray.extend(convert_to_bytes(self.messageLength + 2))
    self.byteArray.extend(convert_to_bytes(self.messageID))
    if self.messageLength > 0:
      self.byteArray.extend(self.messagePacket)
    return True

  def addCRC(self):
    crc = self._CRC_Calculate()
    self.byteArray.extend(convert_to_bytes(crc))
    return True

  def _CRC_Calculate(self):
    crc = 0
    for i in range(len(self.byteArray)):
      crc = self._CRC_calculateNextCRC(crc, self.byteArray[i])
    return crc

  def _CRC_calculateNextCRC(self, prevCRC, addr):
    lookup = (prevCRC ^ addr) & 0xFF
    return (prevCRC >> 8) ^ CRC16_TABLE[lookup]
  
  def replaceEndEsc(self):
    for i in range(len(self.byteArray)):
      
      # WSLIP: Replace END with ESC and ESC_END
      if self.byteArray[i] == END:
        del self.byteArray[i]
        self.byteArray.insert(i, ESC)
        i+=1
        self.byteArray.insert(i, ESC_END)
        
      # WSLIP: Replace ESC with ESC and ESC_ESC
      elif self.byteArray[i] == ESC:
        del self.byteArray[i]
        self.byteArray.insert(i, ESC)
        i += 1
        self.byteArray.insert(i, ESC_ESC)
  
    return True

  def addEndTags(self):
    # WSLIP: Add END to front and end of datagram
    self.byteArray.insert(0, END)
    self.byteArray.append(END)
    return True


# helper function that takes an int and returns it in bytes
def convert_to_bytes(x, num=2):
  while True:
    try:
      returnBytes = x.to_bytes(num, byteorder='little')
      break
    except OverflowError:
      num += 1 # increase number of bytes needed
  return returnBytes


# adds header info needed in each flash write request payload to the end of the bytearray
def addHeaderInfo(byteArray, address, numOfBytes):
  byteArray.extend(convert_to_bytes(WRITE_COMMAND))
  byteArray.extend(convert_to_bytes(address, 4))
  byteArray.extend(convert_to_bytes(numOfBytes))
    

all_packets = [] # storing all prepared packets into this for now
filename = sys.argv[1]
# opening file, reading in binary, storing contents into bytearray named payload
with open(filename, 'rb', buffering=256) as file:
  currAddress = START_ADDRESS
  counter = 0
  numBytes = 0
  while True:
    payload = bytearray()
    chunk = bytearray(file.read(PAYLOAD_SIZE))
    if not chunk:
      break
    numBytes = len(chunk)
    # add header info
    addHeaderInfo(payload, currAddress, numBytes)
    # add chunk to payload bytearray
    payload.extend(chunk)

    # package payload into WSLIP message
    packet = AVPacket(SOURCE_ID, DESTINATION_ID, counter, FLASH_WRITE_REQUEST, payload)
    counter += 1

    # adding packet to all_packets
    all_packets.append(packet.byteArray)
    
    # increment currAddress
    currAddress += numBytes

# this is for sending packets as byte arrays
# serialized_data = [list(arr) for arr in all_packets]
# for i in range(len(all_packets)):
#     packet_data = {i: serialized_data[i]}
#     print(json.dumps(packet_data))

# this is for sending packets as hex
packets = []
for i in range(len(all_packets)):
    packet_data = {i: all_packets[i].hex()} 
    packets.append(json.dumps(packet_data))
  
for packet in packets:
    print(packet)

# response = requests.post('http://localhost:4000/send-packets', json=data)
# if response.status_code == 200:
#   print("py: data sent")
# else:
#   print("py: error sending data")