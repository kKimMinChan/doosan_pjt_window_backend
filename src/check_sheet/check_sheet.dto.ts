export interface CheckSheet {
  CheckSheetInfo: CheckSheetInfo;
  CheckLists: CheckLists[];
  image: Image;
}

interface CheckSheetInfo {
  Title: string;
  factory_name: string;
  equipment_name: string;
  equipment_number: number;
  inspector: string;
  checker: string;
}

interface CheckLists {
  division: '핵심 항목' | '작업전 점검사항(법적)' | '일반항목';
  number: number;
  check_item: string;
  method: '문서' | '육안' | '기능' | '';
}

interface Image {
  url: string;
}
