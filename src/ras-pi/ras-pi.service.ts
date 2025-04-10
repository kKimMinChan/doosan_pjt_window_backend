import { Injectable } from '@nestjs/common';
import { RasPiDto, WifiChangeDto } from './dto/create-ras-pi.dto';
import { Client } from 'ssh2';

@Injectable()
export class RasPiService {
  wifiChange(wifiChangeDto: WifiChangeDto): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      console.log(wifiChangeDto, 'wifiChangeDto');
      conn
        .on('ready', () => {
          conn.exec(
            `sudo nmcli device wifi connect "${wifiChangeDto.wifiSsid}" password "${wifiChangeDto.wifiPassword}" &`,
            (err, stream) => {
              if (err) return reject(err);

              let result = '';
              let error = '';

              stream
                .on('close', (code) => {
                  conn.end();
                  if (code === 0) {
                    resolve(result);
                  } else {
                    reject(error || `Failed with code ${code}`);
                  }
                })
                .on('data', (data) => {
                  result += data.toString();
                })
                .stderr.on('data', (data) => {
                  error += data.toString();
                });
            },
          );
        })
        .on('error', (err) => reject(err))
        .connect({
          host: wifiChangeDto.hostIp,
          port: 22,
          username: wifiChangeDto.hostName,
          password: wifiChangeDto.hostPassword,
        });
    });
  }

  shutdown(shutDownDto: RasPiDto): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(shutDownDto, 'shutDownDto');
      const conn = new Client();
      conn
        .on('ready', () => {
          conn.exec('sudo shutdown -h now', (err, stream) => {
            if (err) return reject(err);
            let result = '';
            let error = '';
            stream
              .on('close', (code) => {
                conn.end();
                if (code === 0) {
                  resolve('Shutdown command sent');
                } else {
                  reject(error || `Failed with code ${code}`);
                }
              })
              .on('data', (data) => {
                result += data.toString();
              })
              .stderr.on('data', (data) => {
                error += data.toString();
              });
          });
        })
        .on('error', (err) => reject(err))
        .connect({
          host: shutDownDto.hostIp,
          port: 22,
          username: shutDownDto.hostName,
          password: shutDownDto.hostPassword,
        });
    });
  }

  scanWifiNetworks(rasPiDto: RasPiDto): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          conn.exec(
            'sudo nmcli device wifi rescan && sleep 2 && nmcli -t -f SSID device wifi list',
            (err, stream) => {
              if (err) return reject(err);
              let result = '';
              let error = '';
              stream
                .on('close', (code) => {
                  conn.end();
                  if (code === 0) {
                    const ssids = result
                      .split('\n')
                      .map((ssid) => ssid.trim())
                      .filter((ssid) => ssid.length > 0);
                    resolve([...new Set(ssids)]); // 중복 제거
                  } else {
                    reject(error || `Failed with code ${code}`);
                  }
                })
                .on('data', (data) => {
                  result += data.toString();
                })
                .stderr.on('data', (data) => {
                  error += data.toString();
                });
            },
          );
        })
        .on('error', (err) => reject(err))
        .connect({
          host: rasPiDto.hostIp,
          port: 22,
          username: rasPiDto.hostName,
          password: rasPiDto.hostPassword,
        });
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} rasPi`;
  }

  remove(id: number) {
    return `This action removes a #${id} rasPi`;
  }
}
